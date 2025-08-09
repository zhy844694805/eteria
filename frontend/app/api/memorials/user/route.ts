import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  // 优先从Authorization头获取
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // 从cookie中获取token作为备选
  return request.cookies.get('token')?.value || null
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)

    if (!token) {
      return NextResponse.json(
        { error: '未找到认证令牌' },
        { status: 401 }
      )
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
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
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'