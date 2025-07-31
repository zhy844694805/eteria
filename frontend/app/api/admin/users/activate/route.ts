import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth, logAdminAction } from '@/lib/admin-auth'
import { z } from 'zod'

const activateUserSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  activate: z.boolean()
})

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { userId, activate } = activateUserSchema.parse(body)

    // 检查用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isActive: true,
        isBanned: true 
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 不能激活被封禁的用户
    if (activate && targetUser.isBanned) {
      return NextResponse.json(
        { error: '被封禁的用户无法激活，请先解封' },
        { status: 400 }
      )
    }

    // 检查权限：不能操作比自己权限高或相等的用户
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
        { error: '权限不足，无法操作该用户' },
        { status: 403 }
      )
    }

    // 更新用户状态
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: activate
      }
    })

    // 记录管理员操作
    await logAdminAction(
      admin.id,
      activate ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      userId,
      {
        targetUser: {
          name: targetUser.name,
          email: targetUser.email
        },
        previousState: targetUser.isActive
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: `用户已${activate ? '激活' : '禁用'}`
    })
  } catch (error) {
    console.error('修改用户状态失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '请求数据格式错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '修改用户状态失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')