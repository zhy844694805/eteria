import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const toggleLikeSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  userId: z.string().min(1, '用户ID不能为空'),
})

const querySchema = z.object({
  memorialId: z.string().optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// 切换点赞状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = toggleLikeSchema.parse(body)

    // 验证纪念页是否存在
    const memorial = await prisma.memorial.findUnique({
      where: { id: validatedData.memorialId }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 400 }
      )
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 检查是否已经点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_memorialId: {
          userId: validatedData.userId,
          memorialId: validatedData.memorialId,
        }
      }
    })

    let isLiked = false
    let like = null

    if (existingLike) {
      // 如果已点赞，则取消点赞
      await prisma.like.delete({
        where: {
          userId_memorialId: {
            userId: validatedData.userId,
            memorialId: validatedData.memorialId,
          }
        }
      })
      isLiked = false
    } else {
      // 如果未点赞，则添加点赞
      like = await prisma.like.create({
        data: validatedData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          },
          memorial: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        }
      })
      isLiked = true
    }

    // 获取更新后的点赞数
    const totalLikes = await prisma.like.count({
      where: {
        memorialId: validatedData.memorialId
      }
    })

    return NextResponse.json({
      success: true,
      isLiked,
      totalLikes,
      like
    })

  } catch (error) {
    console.error('Toggle like error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}

// 获取点赞列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = querySchema.parse({
      memorialId: searchParams.get('memorialId'),
      userId: searchParams.get('userId'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const page = parseInt(queryData.page || '1')
    const limit = parseInt(queryData.limit || '20')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (queryData.memorialId) {
      where.memorialId = queryData.memorialId
    }
    
    if (queryData.userId) {
      where.userId = queryData.userId
    }

    // 获取点赞列表
    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          },
          memorial: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        }
      }),
      prisma.like.count({ where })
    ])

    return NextResponse.json({
      success: true,
      likes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get likes error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '查询参数有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取点赞列表失败' },
      { status: 500 }
    )
  }
}