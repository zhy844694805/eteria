import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCandleSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  lighterId: z.string().min(1, '点燃者ID不能为空'),
  lighterName: z.string().min(1, '点燃者姓名不能为空').max(50, '点燃者姓名过长'),
  message: z.string().max(200, '留言过长').optional(),
  isAnonymous: z.boolean().optional().default(false),
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

    // 验证点燃者是否存在
    const lighter = await prisma.user.findUnique({
      where: { id: validatedData.lighterId }
    })

    if (!lighter) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 检查是否已经点燃过（防止重复点燃）
    const existingCandle = await prisma.candle.findFirst({
      where: {
        memorialId: validatedData.memorialId,
        lighterId: validatedData.lighterId,
        // 检查最近24小时内是否已点燃
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    if (existingCandle) {
      return NextResponse.json(
        { error: '您今天已经点燃过蜡烛了，请明天再来' },
        { status: 400 }
      )
    }

    // 创建蜡烛记录
    const candle = await prisma.candle.create({
      data: validatedData,
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