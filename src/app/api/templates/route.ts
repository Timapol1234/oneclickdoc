import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const sort = searchParams.get('sort') || 'popularity'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (type && type !== 'both') {
      where.OR = [
        { applicantType: type },
        { applicantType: 'both' }
      ]
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Determine sort order
    const orderBy: any = sort === 'name'
      ? { title: 'asc' }
      : { popularityScore: 'desc' }

    // Get templates
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.template.count({ where }),
    ])

    // Parse JSON fields for response
    const templatesWithParsedData = templates.map(template => ({
      ...template,
      contentJson: JSON.parse(template.contentJson),
      tags: template.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    }))

    return NextResponse.json({
      templates: templatesWithParsedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
