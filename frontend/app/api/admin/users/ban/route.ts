import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth, logAdminAction } from '@/lib/admin-auth'
import { z } from 'zod'

const banUserSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  reason: z.string().min(1, '封禁原因不能为空'),
  duration: z.enum(['1d', '7d', '30d', 'permanent'])
})

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { userId, reason, duration } = banUserSchema.parse(body)

    // 检查用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isBanned: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查是否已经被封禁
    if (targetUser.isBanned) {
      return NextResponse.json(
        { error: '用户已被封禁' },
        { status: 400 }
      )
    }

    // 检查权限：不能封禁比自己权限高或相等的用户
    const roleHierarchy = {
      'USER': 0,
      'MODERATOR': 1,
      'ADMIN': 2,
      'SUPER_ADMIN': 3
    }
    
    const adminLevel = roleHierarchy[admin.role as keyof typeof roleHierarchy] || 0
    const targetLevel = roleHierarchy[targetUser.role as keyof typeof roleHierarchy] || 0
    
    if (targetLevel >= adminLevel) {
      return NextResponse.json(
        { error: '权限不足，无法封禁该用户' },
        { status: 403 }
      )
    }

    // 计算封禁到期时间
    let banExpiresAt: Date | null = null
    if (duration !== 'permanent') {
      const now = new Date()
      const durationMap = {
        '1d': 1 * 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }
      banExpiresAt = new Date(now.getTime() + durationMap[duration])
    }

    // 更新用户状态
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        banExpiresAt,
        isActive: false // 封禁时同时禁用账户
      }
    })

    // 记录管理员操作
    await logAdminAction(
      admin.id,
      'BAN_USER',
      userId,
      {
        targetUser: {
          name: targetUser.name,
          email: targetUser.email
        },
        reason,
        duration,
        banExpiresAt: banExpiresAt?.toISOString()
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: '用户已被封禁'
    })
  } catch (error) {
    console.error('封禁用户失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '请求数据格式错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '封禁用户失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')