import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 验证请求数据的schema
const createImageGenerationSchema = z.object({
  memorialId: z.string().optional(),
  digitalLifeId: z.string().optional(),
  sourceImageUrl: z.string().url(),
  sceneType: z.enum(['HEAVEN', 'GARDEN', 'CLOUD', 'FOREST', 'BEACH', 'MOUNTAIN', 'CITY', 'HOME', 'CUSTOM']),
  sceneDescription: z.string(),
  customPrompt: z.string().optional(),
  style: z.string().optional(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  width: z.number().min(512).max(2048).optional(),
  height: z.number().min(512).max(2048).optional(),
  steps: z.number().min(10).max(100).optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
  isPublic: z.boolean().optional()
})

type CreateImageGenerationRequest = z.infer<typeof createImageGenerationSchema>

// 构建完整的提示词
function buildPrompt(data: CreateImageGenerationRequest): string {
  let prompt = data.sceneDescription
  
  // 如果有自定义提示词，加入其中
  if (data.customPrompt) {
    prompt += `, ${data.customPrompt}`
  }
  
  // 添加风格描述
  if (data.style) {
    prompt += `, ${data.style} style`
  }
  
  // 添加质量描述词
  prompt += ', high quality, detailed, beautiful lighting, masterpiece'
  
  return prompt
}

// 生成负面提示词
function buildNegativePrompt(): string {
  return 'low quality, blurry, distorted, ugly, deformed, extra limbs, bad anatomy, worst quality, low resolution, bad art, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, bad proportions, extra limbs, cloned face, disfigured, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers'
}

// 模拟向外部图片生成服务发送请求
async function submitToImageGenerationService(taskId: string, imageGeneration: any): Promise<string> {
  // 这里应该调用实际的图片生成服务API
  // 例如 Stable Diffusion, DALL-E, Midjourney 等
  
  // 模拟异步处理
  console.log(`图片生成任务提交到外部服务: ${taskId}`)
  console.log('提示词:', imageGeneration.prompt)
  console.log('源图片:', imageGeneration.sourceImageUrl)
  
  // 返回外部服务的任务ID
  // 实际实现时，这里会返回真实的外部服务任务ID
  return `ext_${taskId}_${Date.now()}`
}

// 获取用户ID（从JWT token或cookies）
async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  try {
    // 这里应该从JWT token中解析用户ID
    // 目前先从cookie中获取，实际项目中需要验证JWT
    const authCookie = request.cookies.get('auth-token')
    if (!authCookie) {
      return null
    }
    
    // 简化处理，实际应该验证JWT并获取用户ID
    // 这里返回一个模拟的用户ID，实际实现时需要替换
    return 'current-user-id'
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validationResult = createImageGenerationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // 获取当前用户ID
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }
    
    // 验证纪念页面或数字生命是否属于当前用户
    if (data.memorialId) {
      const memorial = await prisma.memorial.findFirst({
        where: { id: data.memorialId, authorId: userId }
      })
      if (!memorial) {
        return NextResponse.json(
          { error: '无权访问该纪念页面' },
          { status: 403 }
        )
      }
    }
    
    if (data.digitalLifeId) {
      const digitalLife = await prisma.digitalLife.findFirst({
        where: { id: data.digitalLifeId, creatorId: userId }
      })
      if (!digitalLife) {
        return NextResponse.json(
          { error: '无权访问该数字生命' },
          { status: 403 }
        )
      }
    }
    
    // 构建提示词
    const prompt = buildPrompt(data)
    const negativePrompt = buildNegativePrompt()
    
    // 创建数据库记录
    const imageGeneration = await prisma.imageGeneration.create({
      data: {
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        description: data.description || '',
        sourceImageUrl: data.sourceImageUrl,
        sceneType: data.sceneType,
        sceneDescription: data.sceneDescription,
        style: data.style,
        prompt: prompt,
        negativePrompt: negativePrompt,
        width: data.width || 1024,
        height: data.height || 1024,
        steps: data.steps || 30,
        guidanceScale: data.guidanceScale || 7.5,
        status: 'PENDING',
        isPublic: data.isPublic || false,
        creatorId: userId,
        memorialId: data.memorialId,
        digitalLifeId: data.digitalLifeId
      }
    })
    
    try {
      // 提交到外部图片生成服务
      const externalTaskId = await submitToImageGenerationService(
        imageGeneration.taskId, 
        imageGeneration
      )
      
      // 更新数据库记录，保存外部任务ID
      await prisma.imageGeneration.update({
        where: { id: imageGeneration.id },
        data: { 
          taskId: externalTaskId,
          status: 'PROCESSING'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: '图片生成任务已创建',
        task: {
          id: imageGeneration.id,
          taskId: externalTaskId,
          status: 'PROCESSING',
          title: imageGeneration.title
        }
      }, { status: 201 })
      
    } catch (serviceError) {
      console.error('提交到图片生成服务失败:', serviceError)
      
      // 更新任务状态为失败
      await prisma.imageGeneration.update({
        where: { id: imageGeneration.id },
        data: { 
          status: 'FAILED',
          errorMessage: '提交到图片生成服务失败'
        }
      })
      
      return NextResponse.json({
        success: false,
        error: '图片生成服务暂时不可用，请稍后重试'
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('创建图片生成任务失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}