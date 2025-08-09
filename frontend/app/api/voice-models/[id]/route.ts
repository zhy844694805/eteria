import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-db'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取单个语音模型详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voiceModel = await prisma.voiceModel.findUnique({
      where: {
        id: params.id
      },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            title: true,
            slug: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            syntheses: true
          }
        }
      }
    })

    if (!voiceModel) {
      return NextResponse.json(
        { error: '语音模型不存在' },
        { status: 404 }
      )
    }

    // 如果模型不是公开的，需要验证权限
    if (!voiceModel.isPublic) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: '需要身份验证' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.userId !== voiceModel.creatorId) {
        return NextResponse.json(
          { error: '无权限访问此语音模型' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      voiceModel
    })

  } catch (error: any) {
    console.error('获取语音模型失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新语音模型
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查语音模型是否存在并且属于当前用户
    const existingModel = await prisma.voiceModel.findFirst({
      where: {
        id: params.id,
        creatorId: decoded.userId
      }
    })

    if (!existingModel) {
      return NextResponse.json(
        { error: '语音模型不存在或您没有权限修改' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, isPublic, allowPublicUse, maxUsagePerDay } = body

    // 更新语音模型
    const updatedModel = await prisma.voiceModel.update({
      where: {
        id: params.id
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isPublic !== undefined && { isPublic }),
        ...(allowPublicUse !== undefined && { allowPublicUse }),
        ...(maxUsagePerDay !== undefined && { maxUsagePerDay })
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
      voiceModel: updatedModel,
      message: '语音模型更新成功'
    })

  } catch (error: any) {
    console.error('更新语音模型失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除语音模型
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查语音模型是否存在并且属于当前用户
    const existingModel = await prisma.voiceModel.findFirst({
      where: {
        id: params.id,
        creatorId: decoded.userId
      }
    })

    if (!existingModel) {
      return NextResponse.json(
        { error: '语音模型不存在或您没有权限删除' },
        { status: 404 }
      )
    }

    // 删除语音模型（级联删除相关的合成记录）
    await prisma.voiceModel.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      success: true,
      message: '语音模型删除成功'
    })

  } catch (error: any) {
    console.error('删除语音模型失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'