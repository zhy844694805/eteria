import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌不能为空'),
  password: z.string().min(6, '密码至少需要6个字符')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // 令牌未过期
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '重置令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 加密新密码
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: '密码重置成功！'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
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