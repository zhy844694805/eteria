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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=oauth_error`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=missing_code`)
  }

  try {
    // 交换授权码获取token
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // 获取用户信息
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: googleUser } = await oauth2.userinfo.get()

    if (!googleUser.email) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=no_email`)
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

    // 重定向到成功页面，携带token
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL}/login`)
    redirectUrl.searchParams.set('google_auth', 'success')
    redirectUrl.searchParams.set('token', token)
    
    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=oauth_failed`)
  }
}