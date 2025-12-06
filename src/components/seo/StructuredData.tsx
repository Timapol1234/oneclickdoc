interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Организация
export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'oneclickdoc',
    url: 'https://oneclickdoc.ru',
    logo: 'https://oneclickdoc.ru/logo.png',
    description:
      'Простой конструктор для создания юридически верных заявлений в МФЦ, суды, банки, ФНС',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
    },
    sameAs: [
      // Add social media links when available
    ],
  }

  return <StructuredData data={data} />
}

// Веб-сайт
export function WebSiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'oneclickdoc',
    url: 'https://oneclickdoc.ru',
    description:
      'Создавайте юридически корректные заявления для МФЦ, судов, банков и других организаций',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://oneclickdoc.ru/templates?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <StructuredData data={data} />
}

// Хлебные крошки
export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <StructuredData data={data} />
}

// Список услуг/продуктов
export function ItemListSchema({
  items,
  name,
}: {
  items: Array<{ name: string; description: string; url: string }>
  name: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: item.name,
        description: item.description,
        url: item.url,
      },
    })),
  }

  return <StructuredData data={data} />
}

// FAQ страница
export function FAQSchema({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return <StructuredData data={data} />
}

// Статья/Продукт
export function ProductSchema({
  name,
  description,
  url,
  category,
}: {
  name: string
  description: string
  url: string
  category: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    description: description,
    url: url,
    category: category,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
    },
  }

  return <StructuredData data={data} />
}
