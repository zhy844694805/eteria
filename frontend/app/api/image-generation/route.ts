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

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    const status = searchParams.get('status') // 筛选状态
    const memorialId = searchParams.get('memorialId') // 筛选纪念页面
    const digitalLifeId = searchParams.get('digitalLifeId') // 筛选数字生命
    
    // 获取当前用户ID
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }
    
    // 构建查询条件
    const whereClause: any = {
      creatorId: userId
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (memorialId) {
      whereClause.memorialId = memorialId
    }
    
    if (digitalLifeId) {
      whereClause.digitalLifeId = digitalLifeId
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 查询图片生成记录
    const [imageGenerations, total] = await Promise.all([
      prisma.imageGeneration.findMany({
        where: whereClause,
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
              subjectName: true,
              images: {
                where: { isMain: true },
                select: { url: true, thumbnailUrl: true },
                take: 1
              }
            }
          },
          digitalLife: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: skip,
        take: limit
      }),
      prisma.imageGeneration.count({
        where: whereClause
      })
    ])
    
    // 统计不同状态的任务数量
    const statusCounts = await prisma.imageGeneration.groupBy({
      by: ['status'],
      where: { creatorId: userId },
      _count: {
        status: true
      }
    })
    
    const stats = {
      total,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    }
    
    statusCounts.forEach(item => {
      const status = item.status.toLowerCase() as keyof typeof stats
      if (status in stats) {
        stats[status] = item._count.status
      }
    })
    
    return NextResponse.json({
      success: true,
      data: imageGenerations.map(item => ({
        id: item.id,
        taskId: item.taskId,
        title: item.title,
        description: item.description,
        status: item.status,
        progress: item.progress,
        sourceImageUrl: item.sourceImageUrl,
        resultImageUrl: item.resultImageUrl,
        sceneType: item.sceneType,
        sceneDescription: item.sceneDescription,
        style: item.style,
        errorMessage: item.errorMessage,
        processingTime: item.processingTime,
        isPublic: item.isPublic,
        viewCount: item.viewCount,
        downloadCount: item.downloadCount,
        shareCount: item.shareCount,
        createdAt: item.createdAt,
        completedAt: item.completedAt,
        creator: item.creator,
        memorial: item.memorial,
        digitalLife: item.digitalLife
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats
    })
    
  } catch (error) {
    console.error('获取图片生成列表失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 批量删除图片生成任务
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskIds } = body
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: '请提供要删除的任务ID列表' },
        { status: 400 }
      )
    }
    
    // 获取当前用户ID
    const userId = await getCurrentUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }
    
    // 查找用户拥有的任务
    const tasks = await prisma.imageGeneration.findMany({
      where: {
        id: { in: taskIds },
        creatorId: userId
      }
    })
    
    if (tasks.length === 0) {
      return NextResponse.json(
        { error: '没有找到可删除的任务' },
        { status: 404 }
      )
    }
    
    // 分别处理不同状态的任务
    const processingTasks = tasks.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING')
    const otherTasks = tasks.filter(t => t.status !== 'PROCESSING' && t.status !== 'PENDING')
    
    let cancelledCount = 0
    let deletedCount = 0
    
    // 取消正在处理的任务
    if (processingTasks.length > 0) {
      const result = await prisma.imageGeneration.updateMany({
        where: { 
          id: { in: processingTasks.map(t => t.id) }
        },
        data: { status: 'CANCELLED' }
      })
      cancelledCount = result.count
    }
    
    // 删除其他任务
    if (otherTasks.length > 0) {
      const result = await prisma.imageGeneration.deleteMany({
        where: { 
          id: { in: otherTasks.map(t => t.id) }
        }
      })
      deletedCount = result.count
    }
    
    return NextResponse.json({
      success: true,
      message: `已处理 ${cancelledCount + deletedCount} 个任务`,
      details: {
        cancelled: cancelledCount,
        deleted: deletedCount
      }
    })
    
  } catch (error) {
    console.error('批量删除图片生成任务失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}