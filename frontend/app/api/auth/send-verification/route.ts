import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

const sendVerificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = sendVerificationSchema.parse(body)

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查用户是否已验证
    if (user.emailVerified) {
      return NextResponse.json(
        { error: '邮箱已验证' },
        { status: 400 }
      )
    }

    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 更新用户验证令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verificationToken,
        // 注意：这里需要添加 tokenExpires 字段到数据库schema
      }
    })

    // 发送验证邮件
    const emailSent = await sendVerificationEmail(email, verificationToken)

    if (!emailSent) {
      return NextResponse.json(
        { error: '邮件发送失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '验证邮件已发送，请查收邮箱'
    })

  } catch (error) {
    console.error('Send verification email error:', error)
    
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