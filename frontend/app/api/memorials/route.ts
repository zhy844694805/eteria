import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
  // Human-specific fields
  relationship: z.string().optional(),
  age: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  // Creator information
  creatorName: z.string().min(1, '创建者姓名不能为空').max(50, '创建者姓名过长'),
  creatorEmail: z.string().email('邮箱格式不正确').optional(),
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
    
    // 验证输入数据
    const validatedData = createMemorialSchema.parse(body)

    // 验证创建者是否存在
    const author = await prisma.user.findUnique({
      where: { id: validatedData.authorId }
    })

    if (!author) {
      return NextResponse.json(
        { error: '创建者不存在' },
        { status: 400 }
      )
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
        relationship: validatedData.relationship,
        age: validatedData.age,
        occupation: validatedData.occupation,
        location: validatedData.location,
        creatorName: validatedData.creatorName,
        creatorEmail: validatedData.creatorEmail,
        creatorPhone: validatedData.creatorPhone,
        authorId: validatedData.authorId,
        isPublic: true,
        status: 'PUBLISHED'
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

    return NextResponse.json({
      success: true,
      memorial
    })

  } catch (error) {
    console.error('Create memorial error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '创建纪念页失败' },
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

    // 获取纪念页列表
    const [memorials, total] = await Promise.all([
      prisma.memorial.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          images: {
            take: 1, // 只获取第一张图片作为封面
            orderBy: {
              isMain: 'desc'
            }
          },
          _count: {
            select: {
              messages: true,
              candles: true,
              likes: true,
            }
          }
        }
      }),
      prisma.memorial.count({ where })
    ])

    return NextResponse.json({
      success: true,
      memorials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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