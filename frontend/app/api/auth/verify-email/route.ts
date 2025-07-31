import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, '验证令牌不能为空')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyEmailSchema.parse(body)

    // 查找具有此验证令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerified: false
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '验证令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null, // 清除验证令牌
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: '邮箱验证成功！',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true
      }
    })

  } catch (error) {
    console.error('Verify email error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 支持GET请求用于链接点击验证
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect('/verify-email?error=missing-token')
    }

    // 查找具有此验证令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerified: false
      }
    })

    if (!user) {
      return NextResponse.redirect('/verify-email?error=invalid-token')
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.redirect('/verify-email?success=true')

  } catch (error) {
    console.error('Verify email GET error:', error)
    return NextResponse.redirect('/verify-email?error=server-error')
  }
}