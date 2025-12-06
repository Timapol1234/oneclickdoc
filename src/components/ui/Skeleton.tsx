import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gray-200',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-label="Загрузка..."
    />
  )
}

// Предустановленные варианты для частых случаев
export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-6">
      <Skeleton variant="text" height={24} width="60%" />
      <Skeleton variant="text" height={16} width="40%" />
      <div className="space-y-2">
        <Skeleton variant="text" height={14} width="100%" />
        <Skeleton variant="text" height={14} width="90%" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={36} width={120} />
        <Skeleton variant="rectangular" height={36} width={80} />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

// Skeleton для карточки шаблона
export function TemplateCardSkeleton() {
  return (
    <div className="h-full rounded-lg border border-border-light bg-white p-6 shadow-card">
      <div className="flex flex-col gap-3">
        {/* Header с иконкой и badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="rectangular" height={20} width={80} />
          </div>
          <Skeleton variant="rectangular" height={20} width={70} />
        </div>

        {/* Заголовок */}
        <Skeleton variant="text" height={24} width="90%" />

        {/* Описание */}
        <div className="space-y-2 flex-grow">
          <Skeleton variant="text" height={16} width="100%" />
          <Skeleton variant="text" height={16} width="85%" />
          <Skeleton variant="text" height={16} width="70%" />
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-1">
          <Skeleton variant="rectangular" height={24} width={60} />
          <Skeleton variant="rectangular" height={24} width={50} />
          <Skeleton variant="rectangular" height={24} width={70} />
        </div>

        {/* Метрики */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton variant="text" height={16} width={60} />
          <Skeleton variant="text" height={16} width={70} />
          <Skeleton variant="text" height={16} width={50} />
        </div>
      </div>
    </div>
  )
}
