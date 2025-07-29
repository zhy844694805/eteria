import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      )
    }

    // 更新最后登录时间
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        preferredSystem: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}