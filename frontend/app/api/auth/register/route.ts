import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

const registerSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名过长'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位').max(100, '密码过长'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12)
    
    // 生成邮箱验证令牌
    const emailVerifyToken = crypto.randomBytes(32).toString('hex')

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerifyToken,
        emailVerified: false, // 默认未验证
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredSystem: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })

    // 发送验证邮件
    try {
      await sendVerificationEmail(email, emailVerifyToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // 即使邮件发送失败，用户仍然创建成功
      // 用户可以稍后重新发送验证邮件
    }

    return NextResponse.json({
      success: true,
      user,
      message: '注册成功！请查收邮箱验证邮件以激活账户。'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    )
  }
}