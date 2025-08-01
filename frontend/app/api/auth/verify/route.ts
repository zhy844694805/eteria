import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

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
    
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        preferredSystem: true,
        provider: true,
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferredSystem: user.preferredSystem?.toLowerCase(),
        provider: user.provider,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: '认证令牌无效' },
      { status: 401 }
    )
  }
}

// POST方法用于Google OAuth回调
export async function POST(request: NextRequest) {
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
    
    // 从数据库获取用户信息，包含OAuth字段
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        preferredSystem: true,
        provider: true,
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferredSystem: user.preferredSystem?.toLowerCase(),
        provider: user.provider,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Token验证失败' },
      { status: 500 }
    )
  }
}