import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth, logAdminAction } from '@/lib/admin-auth'
import { z } from 'zod'

const unbanUserSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空')
})

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { userId } = unbanUserSchema.parse(body)

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

    // 检查是否已被封禁
    if (!targetUser.isBanned) {
      return NextResponse.json(
        { error: '用户未被封禁' },
        { status: 400 }
      )
    }

    // 解封用户
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
        isActive: true // 解封时恢复活跃状态
      }
    })

    // 记录管理员操作
    await logAdminAction(
      admin.id,
      'UNBAN_USER',
      userId,
      {
        targetUser: {
          name: targetUser.name,
          email: targetUser.email
        }
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: '用户已解封'
    })
  } catch (error) {
    console.error('解封用户失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '请求数据格式错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '解封用户失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')