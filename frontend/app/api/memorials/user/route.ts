import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-db'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供有效的认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // 获取用户的纪念页面
    const memorials = await prisma.memorial.findMany({
      where: {
        authorId: decoded.userId,
        status: 'PUBLISHED' // 只返回已发布的纪念页面
      },
      select: {
        id: true,
        title: true,
        subjectName: true,
        type: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      memorials
    })

  } catch (error: any) {
    console.error('获取用户纪念页面失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'