import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取纪念馆的数字生命（公开访问）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params

    // 获取数字生命信息
    const digitalLife = await prisma.digitalLife.findFirst({
      where: {
        memorialId: memorialId,
        status: 'READY'
      },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            type: true,
            isPublic: true
          }
        }
      }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '未找到数字生命' },
        { status: 404 }
      )
    }

    // 检查纪念馆是否公开
    if (!digitalLife.memorial.isPublic) {
      return NextResponse.json(
        { error: '纪念馆不是公开的' },
        { status: 403 }
      )
    }

    // 只有创建者允许公开对话的数字生命才能被访问
    if (!digitalLife.allowPublicChat) {
      return NextResponse.json(
        { error: '数字生命不允许公开对话' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      digitalLife: {
        id: digitalLife.id,
        name: digitalLife.name,
        description: digitalLife.description,
        status: digitalLife.status,
        allowPublicChat: digitalLife.allowPublicChat,
        conversationCount: digitalLife.conversationCount,
        memorial: digitalLife.memorial
      }
    })

  } catch (error) {
    console.error('获取数字生命失败:', error)
    return NextResponse.json(
      { error: '获取数字生命失败' },
      { status: 500 }
    )
  }
}