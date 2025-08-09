import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

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

// 获取单个语音模型详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // 获取语音模型 - 只返回创建者自己的模型
    const voiceModel = await prisma.voiceModel.findFirst({
      where: {
        id: id,
        creatorId: decoded.userId
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

    if (!voiceModel) {
      return NextResponse.json(
        { error: '语音模型不存在或您没有访问权限' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      voiceModel: {
        id: voiceModel.id,
        name: voiceModel.name,
        description: voiceModel.description,
        status: voiceModel.status,
        sampleCount: voiceModel.sampleCount,
        createdAt: voiceModel.createdAt,
        memorial: voiceModel.memorial
      }
    })

  } catch (error: any) {
    console.error('获取语音模型失败:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
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