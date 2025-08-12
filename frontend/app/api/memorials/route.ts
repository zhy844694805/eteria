import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cache, CACHE_CONFIG, cacheKeys, invalidateCache } from '@/lib/cache'
import { normalizeMemorialList } from '@/lib/data-compatibility'

const createMemorialSchema = z.object({
  type: z.enum(['PET', 'HUMAN']),
  subjectName: z.string().min(1, '姓名不能为空').max(100, '姓名过长'),
  birthDate: z.string().optional(), 
  deathDate: z.string().optional(),
  story: z.string().optional(),
  authorId: z.string().min(1, '创建者ID不能为空'),
  // Pet-specific fields  
  subjectType: z.string().optional(), // 宠物类型
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(), // 性格特征
  favoriteActivities: z.array(z.string()).optional(), // 喜欢的活动
  contentChoice: z.string().optional(), // 内容选择方式
  isGuestCreated: z.boolean().optional(), // 是否游客创建
  imageIds: z.array(z.string()).optional(), // 图片ID数组（旧格式，向后兼容）
  imageData: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    url: z.string(),
    size: z.number(),
    mimeType: z.string(),
    isMain: z.boolean()
  })).optional(), // 图片数据数组（新格式）
  // Human-specific fields
  relationship: z.string().optional(),
  age: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  // Creator information
  creatorName: z.string().min(1, '创建者姓名不能为空').max(50, '创建者姓名过长'),
  creatorEmail: z.string().optional(),
  creatorPhone: z.string().optional(),
})

const querySchema = z.object({
  type: z.enum(['PET', 'HUMAN']).optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// 创建纪念页
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('接收到的请求数据:', JSON.stringify(body, null, 2))
    
    // 验证输入数据
    const validatedData = createMemorialSchema.parse(body)
    console.log('验证后的数据:', JSON.stringify(validatedData, null, 2))
    
    // 记录图片ID信息
    if (validatedData.imageIds && validatedData.imageIds.length > 0) {
      console.log('将要关联的图片ID:', validatedData.imageIds)
    }

    // 验证创建者是否存在
    let author = null
    let finalAuthorId = validatedData.authorId

    if (validatedData.isGuestCreated) {
      // 游客创建：使用或创建系统游客用户
      const guestUser = await prisma.user.upsert({
        where: { email: 'guest@system.internal' },
        update: {},
        create: {
          id: 'system-guest-user',
          name: '游客',
          email: 'guest@system.internal',
          passwordHash: null, // 游客用户没有密码
          provider: 'system',
          emailVerified: true
        }
      })
      finalAuthorId = guestUser.id
      console.log('游客创建模式，使用系统游客用户:', finalAuthorId)
    } else {
      author = await prisma.user.findUnique({
        where: { id: validatedData.authorId }
      })

      if (!author) {
        return NextResponse.json(
          { error: '创建者不存在' },
          { status: 400 }
        )
      }
    }

    // 生成slug（基于名字和类型）
    const slug = `${validatedData.subjectName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')}-${validatedData.type.toLowerCase()}-${Date.now()}`

    // 创建纪念页
    const memorial = await prisma.memorial.create({
      data: {
        title: validatedData.subjectName, // 使用subjectName作为title
        slug,
        type: validatedData.type,
        subjectName: validatedData.subjectName,
        subjectType: validatedData.subjectType,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        deathDate: validatedData.deathDate ? new Date(validatedData.deathDate) : null,
        story: validatedData.story,
        breed: validatedData.breed, 
        color: validatedData.color,
        gender: validatedData.gender,
        personalityTraits: validatedData.personalityTraits ? validatedData.personalityTraits.join(', ') : null,
        favoriteThings: validatedData.favoriteActivities ? validatedData.favoriteActivities.join(', ') : null,
        relationship: validatedData.relationship,
        age: validatedData.age,
        occupation: validatedData.occupation,
        location: validatedData.location,
        creatorName: validatedData.creatorName,
        creatorEmail: validatedData.creatorEmail,
        creatorPhone: validatedData.creatorPhone,
        authorId: finalAuthorId,
        isPublic: true,
        status: 'PUBLISHED',
        allowCandles: true,
        allowMessages: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: true,
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        candles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: true,
        tags: true,
        _count: {
          select: {
            messages: true,
            candles: true,
            likes: true,
          }
        }
      }
    })

    // 如果提供了imageData，创建图片记录
    if (validatedData.imageData && validatedData.imageData.length > 0) {
      console.log('创建图片记录:', validatedData.imageData.length, '张图片')
      
      const imageRecords = []
      for (let i = 0; i < validatedData.imageData.length; i++) {
        const imageInfo = validatedData.imageData[i]
        try {
          const imageRecord = await prisma.memorialImage.create({
            data: {
              memorialId: memorial.id,
              filename: imageInfo.filename,
              originalName: imageInfo.originalName,
              url: imageInfo.url,
              size: imageInfo.size,
              mimeType: imageInfo.mimeType,
              isMain: imageInfo.isMain,
              order: i
            }
          })
          imageRecords.push(imageRecord)
          console.log('成功创建图片记录:', imageRecord.id)
        } catch (imageError) {
          console.error('创建图片记录失败:', imageError)
          // 继续处理其他图片，不中断整个流程
        }
      }
      
      // 重新获取包含图片的memorial数据
      const memorialWithImages = await prisma.memorial.findUnique({
        where: { id: memorial.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          images: {
            orderBy: [
              { isMain: 'desc' },
              { order: 'asc' }
            ]
          },
          messages: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          candles: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          likes: true,
          tags: true,
          _count: {
            select: {
              messages: true,
              candles: true,
              likes: true,
            }
          }
        }
      })
      
      // 失效相关缓存
      invalidateCache.memorial(memorial.id, memorial.slug)
      
      return NextResponse.json({
        success: true,
        memorial: memorialWithImages
      })
    }

    // 失效相关缓存
    invalidateCache.memorial(memorial.id, memorial.slug)
    
    return NextResponse.json({
      success: true,
      memorial
    })

  } catch (error) {
    console.error('Create memorial error:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors)
      return NextResponse.json(
        { 
          error: error.errors[0]?.message || '输入数据有误',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // 更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : '创建纪念页失败'
    console.error('Memorial creation failed:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { 
        error: '创建纪念页失败',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

// 获取纪念页列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = querySchema.parse({
      type: searchParams.get('type') || undefined,
      userId: searchParams.get('userId') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    const page = parseInt(queryData.page || '1')
    const limit = parseInt(queryData.limit || '10')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (queryData.type) {
      where.type = queryData.type
    }
    
    if (queryData.userId) {
      where.authorId = queryData.userId
    }

    // 尝试从缓存获取
    const cacheKey = cacheKeys.memorialList(page, queryData.type, queryData.userId)
    const cached = cache.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true
      })
    }

    // 优化的数据库查询
    const [memorials, total] = await Promise.all([
      prisma.memorial.findMany({
        where: {
          ...where,
          status: 'PUBLISHED', // 只显示已发布的
          isPublic: true // 只显示公开的
        },
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' }, // 精选内容优先
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          subjectName: true,
          subjectType: true,
          birthDate: true,
          deathDate: true,
          age: true,
          breed: true,
          relationship: true,
          viewCount: true,
          candleCount: true,
          messageCount: true,
          likeCount: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
            }
          },
          images: {
            take: 1,
            where: { isMain: true },
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              width: true,
              height: true,
              isMain: true
            },
            orderBy: [
              { isMain: 'desc' },
              { order: 'asc' }
            ]
          },
          _count: {
            select: {
              messages: true,
              candles: true,
              likes: true
            }
          }
        }
      }),
      prisma.memorial.count({ 
        where: {
          ...where,
          status: 'PUBLISHED',
          isPublic: true
        }
      })
    ])

    const response = {
      success: true,
      memorials: normalizeMemorialList(memorials),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    // 缓存结果
    cache.set(cacheKey, response, CACHE_CONFIG.MEMORIAL_LIST)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_CONFIG.MEMORIAL_LIST}, s-maxage=${CACHE_CONFIG.MEMORIAL_LIST}`,
        'ETag': `"${Date.now()}"`,
      }
    })

  } catch (error) {
    console.error('Get memorials error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '查询参数有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取纪念页列表失败' },
      { status: 500 }
    )
  }
}