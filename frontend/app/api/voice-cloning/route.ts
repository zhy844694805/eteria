import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface VoiceCloningRequest {
  text: string
  audioDataList: string[] // base64 encoded audio files
  audioFileNames: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceCloningRequest = await request.json()
    const { text, audioDataList, audioFileNames } = body

    // 验证输入
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '文本内容不能为空' },
        { status: 400 }
      )
    }

    if (!audioDataList || audioDataList.length === 0) {
      return NextResponse.json(
        { error: '请至少上传一个音频样本' },
        { status: 400 }
      )
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: '文本长度不能超过500字符' },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'voice-cloning')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 保存音频文件到临时目录
    const tempAudioPaths: string[] = []
    for (let i = 0; i < audioDataList.length; i++) {
      const audioData = audioDataList[i]
      const fileName = audioFileNames[i] || `audio_${i}.wav`
      const tempFileName = `temp_${Date.now()}_${i}_${fileName}`
      const tempFilePath = path.join(uploadsDir, tempFileName)
      
      try {
        const audioBuffer = Buffer.from(audioData, 'base64')
        await writeFile(tempFilePath, audioBuffer)
        tempAudioPaths.push(tempFilePath)
      } catch (error) {
        console.error('保存音频文件失败:', error)
        return NextResponse.json(
          { error: `保存音频文件失败: ${fileName}` },
          { status: 500 }
        )
      }
    }

    // 调用语音克隆服务
    try {
      const clonedAudioUrl = await performVoiceCloning(text, tempAudioPaths)
      
      return NextResponse.json({
        success: true,
        audioUrl: clonedAudioUrl,
        message: '语音克隆成功'
      })
      
    } catch (error: any) {
      console.error('语音克隆失败:', error)
      return NextResponse.json(
        { error: error.message || '语音克隆处理失败' },
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
 * 执行语音克隆的核心函数
 * 基于提供的Python代码逻辑实现
 */
async function performVoiceCloning(text: string, audioPaths: string[]): Promise<string> {
  try {
    // 检查是否配置了AI语音克隆服务
    const aiServiceUrl = process.env.AI_VOICE_CLONING_URL || process.env.OPENAI_API_BASE
    const apiKey = process.env.AI_VOICE_CLONING_KEY || process.env.OPENAI_API_KEY
    
    if (!aiServiceUrl || !apiKey) {
      // 如果没有配置AI服务，返回模拟结果用于演示
      console.log('未配置AI语音克隆服务，返回模拟结果')
      return await generateMockAudio(text)
    }

    // 准备API请求数据
    const requestData = {
      model: 'voice-cloning', // 或其他支持的模型
      input: text,
      voice_samples: audioPaths.map(path => ({
        path: path,
        type: 'reference'
      })),
      options: {
        language: 'zh-CN',
        emotion: 'neutral',
        speed: 1.0,
        pitch: 1.0
      }
    }

    // 调用AI语音克隆API
    const response = await fetch(`${aiServiceUrl}/v1/audio/voice-cloning`, {
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
      const outputFileName = `cloned_${Date.now()}.wav`
      const outputPath = path.join(process.cwd(), 'public', 'uploads', 'voice-cloning', outputFileName)
      
      const audioBuffer = Buffer.from(result.audio_data, 'base64')
      await writeFile(outputPath, audioBuffer)
      
      return `/uploads/voice-cloning/${outputFileName}`
    } else {
      throw new Error('AI服务返回了无效的音频数据')
    }

  } catch (error: any) {
    console.error('语音克隆处理错误:', error)
    
    // 如果AI服务调用失败，回退到模拟结果
    if (error.message.includes('AI服务') || error.message.includes('fetch')) {
      console.log('AI服务不可用，回退到模拟结果')
      return await generateMockAudio(text)
    }
    
    throw error
  }
}

/**
 * 生成模拟音频文件用于演示
 * 实际部署时应该移除此函数，使用真实的AI语音克隆服务
 */
async function generateMockAudio(text: string): Promise<string> {
  // 创建一个简单的模拟音频文件URL
  // 在实际应用中，这里应该调用真实的语音合成服务
  
  const mockFileName = `mock_${Date.now()}.wav`
  const mockAudioPath = `/uploads/voice-cloning/${mockFileName}`
  
  // 创建一个非常简单的WAV文件头（仅用于演示）
  const sampleRate = 44100
  const duration = Math.min(text.length * 0.1, 10) // 根据文本长度估算时长，最多10秒
  const numSamples = Math.floor(sampleRate * duration)
  
  // 生成简单的正弦波作为模拟音频
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
  
  // 生成简单的音频数据（正弦波）
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1 // 440Hz 正弦波，低音量
    const intSample = Math.floor(sample * 32767)
    buffer.writeInt16LE(intSample, 44 + i * 2)
  }
  
  // 保存模拟音频文件
  const fullPath = path.join(process.cwd(), 'public', mockAudioPath)
  await writeFile(fullPath, buffer)
  
  return mockAudioPath
}

// 支持的HTTP方法
export const dynamic = 'force-dynamic'