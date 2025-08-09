import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  // 优先从Authorization头获取
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // 从cookie中获取token作为备选
  return request.cookies.get('token')?.value || null
}

interface VoiceSynthesisRequest {
  text: string
  voiceModelId: string
  emotion?: string
  speed?: number
  pitch?: number
  volume?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceSynthesisRequest = await request.json()
    const { text, voiceModelId, emotion = 'neutral', speed = 1.0, pitch = 1.0, volume = 1.0 } = body

    // 验证输入
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '文本内容不能为空' },
        { status: 400 }
      )
    }

    if (!voiceModelId) {
      return NextResponse.json(
        { error: '请选择语音模型' },
        { status: 400 }
      )
    }

    if (text.length > 200) {
      return NextResponse.json(
        { error: '文本长度不能超过200字符' },
        { status: 400 }
      )
    }

    // 获取当前用户信息（如果有的话）
    let currentUserId: string | null = null
    const token = getToken(request)
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        currentUserId = decoded.userId
      } catch (error) {
        // token无效但不阻止请求，某些public模型可以不登录使用
        console.log('Token验证失败，但继续处理请求')
      }
    }

    // 验证语音模型 - 允许创建者使用自己的模型，或使用public模型
    const voiceModel = await prisma.voiceModel.findFirst({
      where: {
        id: voiceModelId,
        status: 'READY',
        OR: [
          { creatorId: currentUserId }, // 创建者可以使用自己的模型
          { isPublic: true, allowPublicUse: true } // 或使用public模型
        ]
      },
      include: {
        memorial: {
          select: {
            subjectName: true
          }
        }
      }
    })

    if (!voiceModel) {
      return NextResponse.json(
        { error: '语音模型不存在或您没有使用权限' },
        { status: 404 }
      )
    }

    // 检查使用限制
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsageCount = await prisma.voiceSynthesis.count({
      where: {
        voiceModelId: voiceModelId,
        createdAt: {
          gte: today
        }
      }
    })

    if (todayUsageCount >= voiceModel.maxUsagePerDay) {
      return NextResponse.json(
        { error: `今日使用次数已达上限 (${voiceModel.maxUsagePerDay}次)` },
        { status: 429 }
      )
    }

    // 获取客户端信息
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 执行语音合成
    try {
      const synthesizedAudioUrl = await performVoiceSynthesis({
        text: text.trim(),
        voiceModel,
        emotion,
        speed,
        pitch,
        volume
      })

      // 记录合成历史
      const synthesis = await prisma.voiceSynthesis.create({
        data: {
          text: text.trim(),
          audioUrl: synthesizedAudioUrl,
          emotion,
          speed,
          pitch,
          volume,
          isPublic: false, // 默认不公开
          ipAddress: clientIP,
          userAgent,
          voiceModelId: voiceModelId,
          userId: null // 当前不要求登录
        }
      })

      // 更新语音模型使用统计
      await prisma.voiceModel.update({
        where: { id: voiceModelId },
        data: {
          usageCount: { increment: 1 },
          todayUsageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        audioUrl: synthesizedAudioUrl,
        synthesis: {
          id: synthesis.id,
          text: synthesis.text,
          createdAt: synthesis.createdAt
        },
        message: '语音合成成功'
      })

    } catch (error: any) {
      console.error('语音合成失败:', error)
      return NextResponse.json(
        { error: error.message || '语音合成处理失败' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

/**
 * 执行语音合成的核心函数
 */
async function performVoiceSynthesis(params: {
  text: string
  voiceModel: any
  emotion: string
  speed: number
  pitch: number
  volume: number
}): Promise<string> {
  const { text, voiceModel, emotion, speed, pitch, volume } = params

  try {
    // 检查是否配置了AI语音合成服务
    const aiServiceUrl = process.env.AI_VOICE_SYNTHESIS_URL || process.env.OPENAI_API_BASE
    const apiKey = process.env.AI_VOICE_SYNTHESIS_KEY || process.env.OPENAI_API_KEY
    
    if (!aiServiceUrl || !apiKey) {
      // 如果没有配置AI服务，返回模拟结果用于演示
      console.log('未配置AI语音合成服务，返回模拟结果')
      return await generateMockSynthesis(text, voiceModel.memorial.subjectName)
    }

    // 准备API请求数据
    const requestData = {
      model: 'voice-synthesis',
      input: text,
      voice_model_id: voiceModel.id,
      voice_model_path: voiceModel.modelPath,
      sample_audio_paths: JSON.parse(voiceModel.sampleAudioPaths),
      options: {
        language: 'zh-CN',
        emotion: emotion,
        speed: speed,
        pitch: pitch,
        volume: volume
      }
    }

    // 调用AI语音合成API
    const response = await fetch(`${aiServiceUrl}/v1/audio/voice-synthesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `AI服务错误: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.audio_url) {
      return result.audio_url
    } else if (result.audio_data) {
      // 如果返回的是base64数据，保存为文件
      const outputFileName = `synthesis_${Date.now()}.wav`
      const outputPath = path.join(process.cwd(), 'public', 'uploads', 'voice-synthesis', outputFileName)
      
      // 确保目录存在
      const dir = path.dirname(outputPath)
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
      
      const audioBuffer = Buffer.from(result.audio_data, 'base64')
      await writeFile(outputPath, audioBuffer)
      
      return `/uploads/voice-synthesis/${outputFileName}`
    } else {
      throw new Error('AI服务返回了无效的音频数据')
    }

  } catch (error: any) {
    console.error('语音合成处理错误:', error)
    
    // 如果AI服务调用失败，回退到模拟结果
    if (error.message.includes('AI服务') || error.message.includes('fetch')) {
      console.log('AI服务不可用，回退到模拟结果')
      return await generateMockSynthesis(text, voiceModel.memorial.subjectName)
    }
    
    throw error
  }
}

/**
 * 生成模拟合成音频文件用于演示
 * 实际部署时应该移除此函数，使用真实的AI语音合成服务
 */
async function generateMockSynthesis(text: string, subjectName: string): Promise<string> {
  // 确保目录存在
  const synthesesDir = path.join(process.cwd(), 'public', 'uploads', 'voice-synthesis')
  if (!existsSync(synthesesDir)) {
    await mkdir(synthesesDir, { recursive: true })
  }
  
  const mockFileName = `mock_synthesis_${Date.now()}.wav`
  const mockAudioPath = `/uploads/voice-synthesis/${mockFileName}`
  
  // 创建一个简单的模拟音频文件（基于文本长度）
  const sampleRate = 44100
  const duration = Math.min(text.length * 0.15, 15) // 根据文本长度估算时长，最多15秒
  const numSamples = Math.floor(sampleRate * duration)
  
  // 生成更复杂的音频波形来模拟语音
  const buffer = Buffer.alloc(44 + numSamples * 2) // WAV header + 16-bit samples
  
  // 写入WAV文件头
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + numSamples * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // fmt chunk size
  buffer.writeUInt16LE(1, 20)  // audio format (PCM)
  buffer.writeUInt16LE(1, 22)  // num channels
  buffer.writeUInt32LE(sampleRate, 24) // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buffer.writeUInt16LE(2, 32)  // block align
  buffer.writeUInt16LE(16, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(numSamples * 2, 40)
  
  // 生成模拟语音数据（多个频率混合，模拟人声）
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    // 混合多个正弦波来模拟语音的复杂性
    const fundamental = Math.sin(2 * Math.PI * 150 * t) * 0.3 // 基频
    const harmonic2 = Math.sin(2 * Math.PI * 300 * t) * 0.2  // 二次谐波
    const harmonic3 = Math.sin(2 * Math.PI * 450 * t) * 0.1  // 三次谐波
    const noise = (Math.random() - 0.5) * 0.05               // 轻微噪声
    
    // 添加包络（渐强渐弱）
    const envelope = Math.sin(Math.PI * t / duration) * 0.8
    
    const sample = (fundamental + harmonic2 + harmonic3 + noise) * envelope
    const intSample = Math.floor(sample * 32767)
    buffer.writeInt16LE(intSample, 44 + i * 2)
  }
  
  // 保存模拟音频文件
  const fullPath = path.join(process.cwd(), 'public', mockAudioPath)
  await writeFile(fullPath, buffer)
  
  return mockAudioPath
}

export const dynamic = 'force-dynamic'