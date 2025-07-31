import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth, logAdminAction } from '@/lib/admin-auth'

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const role = searchParams.get('role') || 'all'
    
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    // 搜索条件
    if (search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // 状态筛选
    switch (status) {
      case 'active':
        where.isActive = true
        where.isBanned = false
        where.emailVerified = true
        break
      case 'banned':
        where.isBanned = true
        break
      case 'inactive':
        where.isActive = false
        break
      case 'unverified':
        where.emailVerified = false
        break
    }
    
    // 角色筛选
    if (role !== 'all') {
      where.role = role
    }

    // 查询用户列表和总数
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isBanned: true,
          banReason: true,
          banExpiresAt: true,
          emailVerified: true,
          preferredSystem: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              memorials: true,
              messages: true,
              candles: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // 记录管理员查看用户列表的操作
    await logAdminAction(
      admin.id,
      'VIEW_USERS',
      undefined,
      { page, limit, search, status, role, total },
      request
    )

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')