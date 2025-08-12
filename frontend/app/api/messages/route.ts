import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewMessageNotification } from '@/lib/email'
import { z } from 'zod'

const createMessageSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  authorName: z.string().min(1, '作者姓名不能为空').max(50, '作者姓名过长').optional(),
  authorEmail: z.string().email('邮箱格式不正确').optional(),
  content: z.string().min(1, '留言内容不能为空').max(1000, '留言过长'),
  userId: z.string().optional(),
}).refine(data => {
  // 必须提供userId或authorName中的一个
  return data.userId || data.authorName
}, {
  message: '必须提供用户ID或作者姓名',
  path: ['userId'] // 指定错误路径
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
    console.log('收到留言请求:', body)
    const validatedData = createMessageSchema.parse(body)
    console.log('验证通过的数据:', validatedData)

    // 验证纪念页是否存在，并获取创建者信息
    const memorial = await prisma.memorial.findUnique({
      where: { id: validatedData.memorialId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            emailNotificationEnabled: true
          }
        }
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 400 }
      )
    }

    // 检查是否允许留言
    if (!memorial.allowMessages) {
      return NextResponse.json(
        { error: '此纪念页不允许留言' },
        { status: 403 }
      )
    }

    // 如果提供了userId，从数据库获取用户信息
    let authorName = validatedData.authorName
    if (validatedData.userId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: { name: true }
      })
      if (user) {
        authorName = user.name
      }
    }

    // 创建留言
    const message = await prisma.message.create({
      data: {
        memorialId: validatedData.memorialId,
        content: validatedData.content,
        authorName: authorName || '匿名访客',
        authorEmail: validatedData.authorEmail,
        userId: validatedData.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
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

    // 更新纪念页留言数量
    await prisma.memorial.update({
      where: { id: validatedData.memorialId },
      data: {
        messageCount: {
          increment: 1
        }
      }
    })

    // 发送邮件通知给纪念页创建者
    if (memorial.author && memorial.author.email && memorial.author.emailNotificationEnabled) {
      // 检查留言作者是否为纪念页创建者本人（避免自己给自己发邮件）
      const isOwnMessage = validatedData.userId === memorial.author.id
      
      if (!isOwnMessage) {
        try {
          await sendNewMessageNotification(
            memorial.author.email,
            memorial.author.name,
            memorial.subjectName,
            message.authorName || '匿名访客',
            message.content,
            memorial.slug,
            memorial.type as 'PET' | 'HUMAN'
          )
        } catch (emailError) {
          // 邮件发送失败不影响留言创建，仅记录错误
          console.error('Failed to send email notification:', emailError)
        }
      }
    }

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