import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return request.cookies.get('token')?.value || null
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    console.log('Token:', token ? '存在' : '不存在')
    
    if (!token) {
      return NextResponse.json({ error: '未登录', step: 'auth' }, { status: 401 })
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    console.log('Token解码结果:', decoded)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: '无效token', step: 'token_decode' }, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    console.log('用户查询结果:', user ? user.name : '未找到')
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在', step: 'user_lookup' }, { status: 401 })
    }

    const body = await request.json()
    console.log('请求数据:', JSON.stringify(body, null, 2))

    // 检查纪念馆是否存在
    const memorial = await prisma.memorial.findFirst({
      where: {
        id: body.memorialId,
        authorId: user.id
      }
    })
    console.log('纪念馆查询结果:', memorial)

    if (!memorial) {
      return NextResponse.json({ 
        error: '纪念馆不存在或无权限', 
        step: 'memorial_check',
        memorialId: body.memorialId,
        userId: user.id
      }, { status: 404 })
    }

    // 检查是否已有数字生命
    const existingDigitalLife = await prisma.digitalLife.findFirst({
      where: {
        memorialId: body.memorialId,
        creatorId: user.id
      }
    })
    console.log('已存在的数字生命:', existingDigitalLife)

    if (existingDigitalLife) {
      return NextResponse.json({ 
        error: '该纪念馆已创建数字生命', 
        step: 'duplicate_check',
        existingDigitalLife
      }, { status: 409 })
    }

    // 尝试创建
    const createData = {
      name: body.name,
      description: body.description,
      audioSamples: JSON.stringify(body.audioSamples),
      chatRecords: JSON.stringify(body.chatRecords),
      audioCount: body.audioSamples.length,
      chatCount: body.chatRecords.length,
      allowPublicChat: body.allowPublicChat || false,
      creatorId: user.id,
      memorialId: body.memorialId,
      status: 'READY'
    }
    
    console.log('创建数据:', JSON.stringify(createData, null, 2))

    const digitalLife = await prisma.digitalLife.create({
      data: createData
    })

    console.log('创建成功:', digitalLife)

    return NextResponse.json({
      success: true,
      digitalLife,
      debug: {
        user: user.id,
        memorial: memorial.id,
        step: 'success'
      }
    })

  } catch (error) {
    console.error('调试API错误:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      step: 'exception'
    }, { status: 500 })
  }
}