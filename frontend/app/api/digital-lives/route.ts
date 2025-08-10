import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return request.cookies.get('token')?.value || null
}

// 创建数字生命验证 schema
const createDigitalLifeSchema = z.object({
  memorialId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  audioSamples: z.array(z.string()),
  chatRecords: z.array(z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string(),
    speaker: z.enum(['deceased', 'other'])
  })),
  allowPublicChat: z.boolean().optional().default(false)
})

// GET - 获取用户的数字生命列表
export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: '无效token' }, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    const digitalLives = await prisma.digitalLife.findMany({
      where: {
        creatorId: user.id
      },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            title: true,
            images: {
              where: { isMain: true },
              select: {
                url: true,
                thumbnailUrl: true
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      digitalLives
    })

  } catch (error) {
    console.error('获取数字生命列表失败:', error)
    return NextResponse.json(
      { error: '获取数字生命列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建数字生命
export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: '无效token' }, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createDigitalLifeSchema.parse(body)

    // 验证纪念馆是否属于当前用户
    const memorial = await prisma.memorial.findFirst({
      where: {
        id: validatedData.memorialId,
        authorId: user.id
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念馆不存在或无权限' },
        { status: 404 }
      )
    }

    // 检查是否已经为该纪念馆创建了数字生命
    const existingDigitalLife = await prisma.digitalLife.findFirst({
      where: {
        memorialId: validatedData.memorialId,
        creatorId: user.id
      }
    })

    if (existingDigitalLife) {
      return NextResponse.json(
        { error: '该纪念馆已创建数字生命' },
        { status: 409 }
      )
    }

    // 创建数字生命
    const digitalLife = await prisma.digitalLife.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        audioSamples: JSON.stringify(validatedData.audioSamples),
        chatRecords: JSON.stringify(validatedData.chatRecords),
        audioCount: validatedData.audioSamples.length,
        chatCount: validatedData.chatRecords.length,
        allowPublicChat: validatedData.allowPublicChat || false,
        creatorId: user.id,
        memorialId: validatedData.memorialId,
        status: 'READY' // 模拟创建完成状态
      },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      digitalLife
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建数字生命失败:', error)
    return NextResponse.json(
      { error: '创建数字生命失败' },
      { status: 500 }
    )
  }
}