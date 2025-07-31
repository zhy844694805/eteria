import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // 即使用户不存在，也返回成功消息（安全考虑，不泄露用户是否存在）
    if (!user) {
      return NextResponse.json({
        message: '如果该邮箱存在于我们的系统中，我们已发送重置密码的邮件'
      })
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

    // 更新用户重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
        updatedAt: new Date()
      }
    })

    // 发送重置邮件
    const emailSent = await sendPasswordResetEmail(email, resetToken)

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email)
      // 即使邮件发送失败，也返回成功消息（安全考虑）
    }

    return NextResponse.json({
      message: '如果该邮箱存在于我们的系统中，我们已发送重置密码的邮件'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
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