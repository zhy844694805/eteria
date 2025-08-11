import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取用户ID（从JWT token或cookies）
async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  try {
    const authCookie = request.cookies.get('auth-token')
    if (!authCookie) {
      return null
    }
    
    // 简化处理，实际应该验证JWT并获取用户ID
    return 'current-user-id'
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

// 模拟查询外部图片生成服务状态
async function queryExternalServiceStatus(externalTaskId: string) {
  // 这里应该调用实际的图片生成服务状态查询API
  console.log(`查询外部服务状态: ${externalTaskId}`)
  
  // 模拟不同的状态返回
  const statuses = ['PROCESSING', 'COMPLETED', 'FAILED']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  
  if (randomStatus === 'COMPLETED') {
    return {
      status: 'COMPLETED',
      progress: 100,
      resultImageUrl: `https://example.com/generated/${externalTaskId}.jpg`,
      processingTime: 45
    }
  } else if (randomStatus === 'FAILED') {
    return {
      status: 'FAILED',
      progress: 0,
      errorMessage: '图片生成失败：提示词可能包含不当内容'
    }
  } else {
    return {
      status: 'PROCESSING',
      progress: Math.floor(Math.random() * 80) + 10 // 10-90%
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.taskId
    
    // 获取当前用户ID
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }
    
    // 查找图片生成记录
    const imageGeneration = await prisma.imageGeneration.findFirst({
      where: { 
        OR: [
          { id: taskId },
          { taskId: taskId }
        ],
        creatorId: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        memorial: {
          select: {
            id: true,
            title: true,
            subjectName: true
          }
        },
        digitalLife: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!imageGeneration) {
      return NextResponse.json(
        { error: '图片生成任务不存在' },
        { status: 404 }
      )
    }
    
    // 如果任务还在处理中，查询外部服务状态
    if (imageGeneration.status === 'PROCESSING' || imageGeneration.status === 'PENDING') {
      try {
        const externalStatus = await queryExternalServiceStatus(imageGeneration.taskId)
        
        // 更新数据库状态
        const updatedGeneration = await prisma.imageGeneration.update({
          where: { id: imageGeneration.id },
          data: {
            status: externalStatus.status as any,
            progress: externalStatus.progress || imageGeneration.progress,
            resultImageUrl: externalStatus.resultImageUrl || imageGeneration.resultImageUrl,
            processingTime: externalStatus.processingTime || imageGeneration.processingTime,
            errorMessage: externalStatus.errorMessage || imageGeneration.errorMessage,
            completedAt: externalStatus.status === 'COMPLETED' ? new Date() : imageGeneration.completedAt
          }
        })
        
        return NextResponse.json({
          success: true,
          task: {
            id: updatedGeneration.id,
            taskId: updatedGeneration.taskId,
            title: updatedGeneration.title,
            description: updatedGeneration.description,
            status: updatedGeneration.status,
            progress: updatedGeneration.progress,
            sourceImageUrl: updatedGeneration.sourceImageUrl,
            resultImageUrl: updatedGeneration.resultImageUrl,
            sceneType: updatedGeneration.sceneType,
            sceneDescription: updatedGeneration.sceneDescription,
            style: updatedGeneration.style,
            errorMessage: updatedGeneration.errorMessage,
            processingTime: updatedGeneration.processingTime,
            isPublic: updatedGeneration.isPublic,
            createdAt: updatedGeneration.createdAt,
            completedAt: updatedGeneration.completedAt,
            creator: imageGeneration.creator,
            memorial: imageGeneration.memorial,
            digitalLife: imageGeneration.digitalLife
          }
        })
      } catch (serviceError) {
        console.error('查询外部服务状态失败:', serviceError)
        // 如果查询外部服务失败，返回数据库中的状态
      }
    }
    
    // 返回数据库中的状态
    return NextResponse.json({
      success: true,
      task: {
        id: imageGeneration.id,
        taskId: imageGeneration.taskId,
        title: imageGeneration.title,
        description: imageGeneration.description,
        status: imageGeneration.status,
        progress: imageGeneration.progress,
        sourceImageUrl: imageGeneration.sourceImageUrl,
        resultImageUrl: imageGeneration.resultImageUrl,
        sceneType: imageGeneration.sceneType,
        sceneDescription: imageGeneration.sceneDescription,
        style: imageGeneration.style,
        errorMessage: imageGeneration.errorMessage,
        processingTime: imageGeneration.processingTime,
        isPublic: imageGeneration.isPublic,
        viewCount: imageGeneration.viewCount,
        downloadCount: imageGeneration.downloadCount,
        shareCount: imageGeneration.shareCount,
        createdAt: imageGeneration.createdAt,
        completedAt: imageGeneration.completedAt,
        creator: imageGeneration.creator,
        memorial: imageGeneration.memorial,
        digitalLife: imageGeneration.digitalLife
      }
    })
    
  } catch (error) {
    console.error('查询图片生成状态失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除图片生成任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.taskId
    
    // 获取当前用户ID
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }
    
    // 查找并删除图片生成记录
    const imageGeneration = await prisma.imageGeneration.findFirst({
      where: { 
        OR: [
          { id: taskId },
          { taskId: taskId }
        ],
        creatorId: userId
      }
    })
    
    if (!imageGeneration) {
      return NextResponse.json(
        { error: '图片生成任务不存在' },
        { status: 404 }
      )
    }
    
    // 如果任务正在处理，标记为取消
    if (imageGeneration.status === 'PROCESSING' || imageGeneration.status === 'PENDING') {
      await prisma.imageGeneration.update({
        where: { id: imageGeneration.id },
        data: { status: 'CANCELLED' }
      })
    } else {
      // 彻底删除已完成或失败的任务
      await prisma.imageGeneration.delete({
        where: { id: imageGeneration.id }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: '图片生成任务已删除'
    })
    
  } catch (error) {
    console.error('删除图片生成任务失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}