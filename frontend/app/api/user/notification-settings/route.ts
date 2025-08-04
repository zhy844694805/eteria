import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateNotificationSettingsSchema = z.object({
  emailNotificationEnabled: z.boolean()
})

// 获取用户通知设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailNotificationEnabled: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: {
        emailNotificationEnabled: user.emailNotificationEnabled
      }
    })

  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: '获取通知设置失败' },
      { status: 500 }
    )
  }
}

// 更新用户通知设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    const validatedData = updateNotificationSettingsSchema.parse(body)

    // 验证用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 更新通知设置
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotificationEnabled: validatedData.emailNotificationEnabled
      },
      select: {
        id: true,
        emailNotificationEnabled: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '通知设置已更新',
      settings: {
        emailNotificationEnabled: updatedUser.emailNotificationEnabled
      }
    })

  } catch (error) {
    console.error('Update notification settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新通知设置失败' },
      { status: 500 }
    )
  }
}