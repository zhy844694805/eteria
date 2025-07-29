import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMessageSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  authorId: z.string().min(1, '作者ID不能为空'),
  authorName: z.string().min(1, '作者姓名不能为空').max(50, '作者姓名过长'),
  content: z.string().min(1, '留言内容不能为空').max(1000, '留言过长'),
  isAnonymous: z.boolean().optional().default(false),
})

const querySchema = z.object({
  memorialId: z.string().optional(),
  authorId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// 创建留言
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = createMessageSchema.parse(body)

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

    // 验证作者是否存在
    const author = await prisma.user.findUnique({
      where: { id: validatedData.authorId }
    })

    if (!author) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 创建留言
    const message = await prisma.message.create({
      data: validatedData,
      include: {
        author: {
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
      message
    })

  } catch (error) {
    console.error('Create message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '创建留言失败' },
      { status: 500 }
    )
  }
}

// 获取留言列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = querySchema.parse({
      memorialId: searchParams.get('memorialId'),
      authorId: searchParams.get('authorId'),
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
    
    if (queryData.authorId) {
      where.authorId = queryData.authorId
    }

    // 获取留言列表
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
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
      prisma.message.count({ where })
    ])

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get messages error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '查询参数有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取留言列表失败' },
      { status: 500 }
    )
  }
}