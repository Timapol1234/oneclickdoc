import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://oneclickdoc.ru'

  // Проверяем наличие DATABASE_URL
  const isDatabaseAvailable = !!process.env.DATABASE_URL

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Если база данных недоступна, возвращаем только статические страницы
  if (!isDatabaseAvailable) {
    console.warn('DATABASE_URL not available, returning static pages only')
    return staticPages
  }

  // Получаем все шаблоны из базы данных
  let templatePages: MetadataRoute.Sitemap = []
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    })

    templatePages = templates.map((template) => ({
      url: `${baseUrl}/create/${template.id}`,
      lastModified: template.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching templates for sitemap:', error)
  }

  // Получаем все категории
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/templates?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  return [...staticPages, ...categoryPages, ...templatePages]
}
