import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCandleSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  lightedBy: z.string().min(1, '点燃者姓名不能为空').max(50, '点燃者姓名过长'),
  email: z.string().email('邮箱格式不正确').optional(),
  message: z.string().max(200, '留言过长').optional(),
  userId: z.string().optional(),
})

const querySchema = z.object({
  memorialId: z.string().optional(),
  lighterId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// 点燃蜡烛
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = createCandleSchema.parse(body)

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

    // 检查是否允许点燃蜡烛
    if (!memorial.allowCandles) {
      return NextResponse.json(
        { error: '此纪念页不允许点燃蜡烛' },
        { status: 403 }
      )
    }

    // 创建蜡烛记录
    const candle = await prisma.candle.create({
      data: {
        memorialId: validatedData.memorialId,
        lightedBy: validatedData.lightedBy,
        email: validatedData.email,
        message: validatedData.message,
        userId: validatedData.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
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
            subjectName: true,
            type: true,
          }
        }
      }
    })

    // 更新纪念页蜡烛数量
    await prisma.memorial.update({
      where: { id: validatedData.memorialId },
      data: {
        candleCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      candle
    })

  } catch (error) {
    console.error('Create candle error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '点燃蜡烛失败' },
      { status: 500 }
    )
  }
}

// 获取蜡烛列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = querySchema.parse({
      memorialId: searchParams.get('memorialId'),
      lighterId: searchParams.get('lighterId'),
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
    
    if (queryData.lighterId) {
      where.lighterId = queryData.lighterId
    }

    // 获取蜡烛列表
    const [candles, total] = await Promise.all([
      prisma.candle.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          lighter: {
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
      prisma.candle.count({ where })
    ])

    return NextResponse.json({
      success: true,
      candles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get candles error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '查询参数有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取蜡烛列表失败' },
      { status: 500 }
    )
  }
}