import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().min(1, '搜索关键词不能为空'),
  type: z.enum(['PET', 'HUMAN', 'ALL']).optional().default('ALL'),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'ALL'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { q, type: searchType, limit: searchLimit, offset: searchOffset } = searchSchema.parse({
      q: query,
      type,
      limit,
      offset
    })

    // 构建搜索条件
    const searchTerms = q.trim().split(/\s+/).filter(term => term.length > 0)
    
    const whereConditions: any = {
      status: 'PUBLISHED',
      isPublic: true,
      OR: [
        // 搜索纪念页标题
        {
          title: {
            contains: q
          }
        },
        // 搜索被纪念者姓名
        {
          subjectName: {
            contains: q
          }
        },
        // 搜索故事内容
        {
          story: {
            contains: q
          }
        },
        // 搜索回忆内容
        {
          memories: {
            contains: q
          }
        },
        // 搜索性格特点
        {
          personalityTraits: {
            contains: q
          }
        },
        // 搜索爱好
        {
          favoriteThings: {
            contains: q
          }
        },
        // 搜索品种（宠物）
        {
          breed: {
            contains: q
          }
        },
        // 搜索职业（人类）
        {
          occupation: {
            contains: q
          }
        },
        // 搜索地点
        {
          location: {
            contains: q
          }
        }
      ]
    }

    // 添加类型筛选
    if (searchType !== 'ALL') {
      whereConditions.type = searchType
    }

    // 执行搜索
    const [memorials, total] = await Promise.all([
      prisma.memorial.findMany({
        where: whereConditions,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: {
            where: { isMain: true },
            take: 1
          },
          _count: {
            select: {
              messages: true,
              candles: true,
              likes: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: searchLimit,
        skip: searchOffset
      }),
      prisma.memorial.count({
        where: whereConditions
      })
    ])

    // 为每个结果添加相关性评分（简单实现）
    const results = memorials.map(memorial => {
      let relevanceScore = 0
      const searchLower = q.toLowerCase()
      
      // 标题匹配权重最高
      if (memorial.title.toLowerCase().includes(searchLower)) {
        relevanceScore += 10
      }
      
      // 姓名匹配权重高
      if (memorial.subjectName.toLowerCase().includes(searchLower)) {
        relevanceScore += 8
      }
      
      // 内容匹配
      if (memorial.story?.toLowerCase().includes(searchLower)) {
        relevanceScore += 5
      }
      
      if (memorial.memories?.toLowerCase().includes(searchLower)) {
        relevanceScore += 3
      }
      
      if (memorial.personalityTraits?.toLowerCase().includes(searchLower)) {
        relevanceScore += 2
      }
      
      if (memorial.favoriteThings?.toLowerCase().includes(searchLower)) {
        relevanceScore += 2
      }
      
      if (memorial.breed?.toLowerCase().includes(searchLower)) {
        relevanceScore += 4
      }
      
      if (memorial.occupation?.toLowerCase().includes(searchLower)) {
        relevanceScore += 4
      }
      
      return {
        ...memorial,
        relevanceScore
      }
    })

    // 按相关性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({
      success: true,
      results,
      pagination: {
        total,
        limit: searchLimit,
        offset: searchOffset,
        hasMore: searchOffset + searchLimit < total
      },
      searchQuery: q,
      searchType
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Search error:', error)
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    )
  }
}