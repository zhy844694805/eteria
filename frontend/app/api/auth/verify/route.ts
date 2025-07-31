import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 从cookie中获取token
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未找到认证令牌' },
        { status: 401 }
      )
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredSystem: true,
        isActive: true,
        isBanned: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    // 检查用户状态
    if (!user.isActive || user.isBanned) {
      return NextResponse.json(
        { error: '账户已被禁用或封禁' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: '认证令牌无效' },
      { status: 401 }
    )
  }
}