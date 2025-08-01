import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
)

// 获取Google OAuth授权URL
export async function GET() {
  try {
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      include_granted_scopes: true,
    })

    return NextResponse.json({
      success: true,
      authUrl: authorizeUrl
    })
  } catch (error) {
    console.error('Google OAuth URL generation error:', error)
    return NextResponse.json(
      { error: '生成授权链接失败' },
      { status: 500 }
    )
  }
}

// 处理Google OAuth回调
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: '授权码缺失' },
        { status: 400 }
      )
    }

    // 交换授权码获取token
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // 获取用户信息
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: googleUser } = await oauth2.userinfo.get()

    if (!googleUser.email) {
      return NextResponse.json(
        { error: '无法获取用户邮箱信息' },
        { status: 400 }
      )
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    })

    if (user) {
      // 更新现有用户的Google信息
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId: googleUser.id || undefined,
          avatar: googleUser.picture || user.avatar,
          emailVerified: true,
          lastLoginAt: new Date()
        }
      })
    } else {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          provider: 'google',
          providerId: googleUser.id || undefined,
          avatar: googleUser.picture,
          emailVerified: true,
          lastLoginAt: new Date()
        }
      })
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferredSystem: user.preferredSystem,
        provider: user.provider
      }
    })

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.json(
      { error: 'Google登录失败' },
      { status: 500 }
    )
  }
}