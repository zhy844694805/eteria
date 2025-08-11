import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return request.cookies.get('token')?.value || null
}

// POST - 添加音频样本
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const digitalLifeId = resolvedParams.id
    
    const token = getToken(request)
    if (!token) {
      return NextResponse.json(
        { error: '未找到认证令牌' },
        { status: 401 }
      )
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // 获取数字生命信息并检查权限
    const digitalLife = await prisma.digitalLife.findUnique({
      where: { id: digitalLifeId }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '数字生命不存在' },
        { status: 404 }
      )
    }

    if (digitalLife.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: '您没有权限编辑此数字生命' },
        { status: 403 }
      )
    }

    // 解析请求体
    const { audioDataList, audioFileNames } = await request.json()

    if (!audioDataList || !Array.isArray(audioDataList) || audioDataList.length === 0) {
      return NextResponse.json(
        { error: '请提供音频数据' },
        { status: 400 }
      )
    }

    // 创建音频存储目录
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio', 'digital-life', digitalLifeId)
    await fs.mkdir(audioDir, { recursive: true })

    const audioPaths: string[] = []

    // 保存音频文件
    for (let i = 0; i < audioDataList.length; i++) {
      const audioData = audioDataList[i]
      const originalName = audioFileNames[i] || `audio-${i + 1}.mp3`
      const fileName = `${Date.now()}-${i}-${originalName}`
      const filePath = path.join(audioDir, fileName)
      const relativePath = `/uploads/audio/digital-life/${digitalLifeId}/${fileName}`

      // 保存文件
      const buffer = Buffer.from(audioData, 'base64')
      await fs.writeFile(filePath, buffer)

      audioPaths.push(relativePath)
    }

    // 更新数字生命的音频路径
    const currentAudios = digitalLife.uploadedAudios || []
    const updatedAudios = [...currentAudios, ...audioPaths]

    const updatedDigitalLife = await prisma.digitalLife.update({
      where: { id: digitalLifeId },
      data: {
        uploadedAudios: updatedAudios,
        audioCount: updatedAudios.length
      }
    })

    return NextResponse.json({
      success: true,
      audioPaths,
      digitalLife: updatedDigitalLife
    })

  } catch (error: any) {
    console.error('添加音频失败:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '添加音频失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除音频样本
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const digitalLifeId = resolvedParams.id
    
    const token = getToken(request)
    if (!token) {
      return NextResponse.json(
        { error: '未找到认证令牌' },
        { status: 401 }
      )
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // 获取数字生命信息并检查权限
    const digitalLife = await prisma.digitalLife.findUnique({
      where: { id: digitalLifeId }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '数字生命不存在' },
        { status: 404 }
      )
    }

    if (digitalLife.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: '您没有权限编辑此数字生命' },
        { status: 403 }
      )
    }

    // 解析请求体
    const { audioPath } = await request.json()

    if (!audioPath) {
      return NextResponse.json(
        { error: '请提供要删除的音频路径' },
        { status: 400 }
      )
    }

    // 从数字生命记录中移除音频路径
    const currentAudios = digitalLife.uploadedAudios || []
    const updatedAudios = currentAudios.filter(path => path !== audioPath)

    // 删除物理文件
    try {
      const fullPath = path.join(process.cwd(), 'public', audioPath)
      await fs.unlink(fullPath)
    } catch (fileError) {
      console.warn('删除音频文件失败:', fileError)
      // 即使文件删除失败，也继续更新数据库
    }

    // 更新数字生命记录
    const updatedDigitalLife = await prisma.digitalLife.update({
      where: { id: digitalLifeId },
      data: {
        uploadedAudios: updatedAudios,
        audioCount: updatedAudios.length
      }
    })

    return NextResponse.json({
      success: true,
      message: '音频已删除',
      digitalLife: updatedDigitalLife
    })

  } catch (error: any) {
    console.error('删除音频失败:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '删除音频失败' },
      { status: 500 }
    )
  }
}