import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-db'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface CreateVoiceModelRequest {
  name: string
  description?: string
  memorialId: string
  allowPublicUse: boolean
  audioDataList: string[]
  audioFileNames: string[]
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供有效的认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const body: CreateVoiceModelRequest = await request.json()
    const { name, description, memorialId, allowPublicUse, audioDataList, audioFileNames } = body

    // 验证输入
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '语音模型名称不能为空' },
        { status: 400 }
      )
    }

    if (!memorialId) {
      return NextResponse.json(
        { error: '请选择要绑定的纪念页面' },
        { status: 400 }
      )
    }

    if (!audioDataList || audioDataList.length === 0) {
      return NextResponse.json(
        { error: '请至少上传一个音频样本' },
        { status: 400 }
      )
    }

    // 验证纪念页面是否属于当前用户
    const memorial = await prisma.memorial.findFirst({
      where: {
        id: memorialId,
        authorId: decoded.userId,
        type: 'HUMAN' // 只允许绑定到人类纪念页面
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页面不存在或您没有权限' },
        { status: 403 }
      )
    }

    // 检查是否已经有语音模型绑定到此纪念页面
    const existingModel = await prisma.voiceModel.findFirst({
      where: {
        memorialId: memorialId,
        creatorId: decoded.userId
      }
    })

    if (existingModel) {
      return NextResponse.json(
        { error: '此纪念页面已经绑定了语音模型' },
        { status: 400 }
      )
    }

    // 确保存储目录存在
    const voiceModelsDir = path.join(process.cwd(), 'public', 'uploads', 'voice-models')
    if (!existsSync(voiceModelsDir)) {
      await mkdir(voiceModelsDir, { recursive: true })
    }

    // 保存音频文件
    const savedAudioPaths: string[] = []
    for (let i = 0; i < audioDataList.length; i++) {
      const audioData = audioDataList[i]
      const originalFileName = audioFileNames[i] || `audio_${i}.wav`
      const timestamp = Date.now()
      const fileName = `${decoded.userId}_${memorialId}_${timestamp}_${i}_${originalFileName}`
      const filePath = path.join(voiceModelsDir, fileName)
      
      try {
        const audioBuffer = Buffer.from(audioData, 'base64')
        await writeFile(filePath, audioBuffer)
        savedAudioPaths.push(`/uploads/voice-models/${fileName}`)
      } catch (error) {
        console.error('保存音频文件失败:', error)
        return NextResponse.json(
          { error: `保存音频文件失败: ${originalFileName}` },
          { status: 500 }
        )
      }
    }

    // 创建语音模型记录
    const voiceModel = await prisma.voiceModel.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sampleAudioPaths: JSON.stringify(savedAudioPaths),
        sampleCount: savedAudioPaths.length,
        status: 'READY', // 简化流程，直接设为可用
        isPublic: allowPublicUse,
        allowPublicUse: allowPublicUse,
        maxUsagePerDay: 50, // 默认每日50次
        quality: 0.8, // 模拟质量评分
        accuracy: 0.85,
        similarity: 0.9,
        creatorId: decoded.userId,
        memorialId: memorialId
      },
      include: {
        memorial: {
          select: {
            subjectName: true,
            title: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      voiceModel: {
        id: voiceModel.id,
        name: voiceModel.name,
        description: voiceModel.description,
        status: voiceModel.status,
        memorial: voiceModel.memorial
      },
      message: '语音模型创建成功'
    })

  } catch (error: any) {
    console.error('创建语音模型失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取语音模型列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memorialId = searchParams.get('memorialId')
    const publicOnly = searchParams.get('publicOnly') === 'true'

    let whereClause: any = {
      status: 'READY'
    }

    if (memorialId) {
      whereClause.memorialId = memorialId
    }

    if (publicOnly) {
      whereClause.isPublic = true
      whereClause.allowPublicUse = true
    }

    const voiceModels = await prisma.voiceModel.findMany({
      where: whereClause,
      include: {
        memorial: {
          select: {
            subjectName: true,
            title: true,
            slug: true
          }
        },
        creator: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            syntheses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      voiceModels
    })

  } catch (error: any) {
    console.error('获取语音模型失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'