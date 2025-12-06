import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/create/*/preview',
          '/_next/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/create/*/preview',
        ],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/create/*/preview',
        ],
      },
    ],
    sitemap: 'https://oneclickdoc.ru/sitemap.xml',
  }
}
