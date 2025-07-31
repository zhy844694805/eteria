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
    console.log('=== 调试登录API开始 ===')
    
    // 检查环境变量
    console.log('JWT_SECRET 是否设置:', !!process.env.JWT_SECRET)
    console.log('JWT_SECRET 长度:', process.env.JWT_SECRET?.length)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    const body = await request.json()
    console.log('请求体:', body)
    
    // 验证输入数据
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData
    console.log('验证后的数据:', { email, password: '***' })

    // 查找用户
    console.log('查找用户:', email)
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log('找到用户:', user ? `${user.name} (${user.id})` : '未找到')

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    // 验证密码
    console.log('验证密码...')
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    console.log('密码验证结果:', isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      )
    }

    // 更新最后登录时间
    console.log('更新最后登录时间...')
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredSystem: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })
    console.log('更新后的用户:', updatedUser)

    // 尝试创建JWT token
    console.log('尝试创建JWT token...')
    let token = null
    try {
      // 动态导入jwt以避免模块问题
      const jwt = await import('jsonwebtoken')
      console.log('JWT模块加载成功')
      
      token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )
      console.log('JWT token创建成功, 长度:', token.length)
    } catch (jwtError) {
      console.error('JWT创建失败:', jwtError)
      // 暂时不使用JWT，直接返回用户信息
      return NextResponse.json({
        success: true,
        user: updatedUser,
        debug: {
          jwtError: jwtError.message,
          noJWT: true
        }
      })
    }

    // 创建响应并设置cookie
    console.log('创建响应...')
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      debug: {
        tokenLength: token?.length,
        jwtSecret: !!process.env.JWT_SECRET
      }
    })

    if (token) {
      // 设置HTTP-only cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7天
        path: '/',
      })
      console.log('Cookie设置成功')
    }

    console.log('=== 调试登录API结束 ===')
    return response

  } catch (error) {
    console.error('=== 调试登录API错误 ===')
    console.error('错误类型:', error.constructor.name)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    console.error('=== 错误结束 ===')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: error.errors[0]?.message || '输入数据有误',
          debug: {
            zodErrors: error.errors
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: '登录失败，请重试',
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message
        }
      },
      { status: 500 }
    )
  }
}