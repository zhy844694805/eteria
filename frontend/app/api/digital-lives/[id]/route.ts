import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return request.cookies.get('token')?.value || null
}

// GET - 获取数字生命详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const digitalLifeId = resolvedParams.id
    
    // 获取数字生命信息
    const digitalLife = await prisma.digitalLife.findUnique({
      where: { id: digitalLifeId },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            title: true,
            isPublic: true,
            images: {
              where: { isMain: true },
              select: {
                url: true,
                thumbnailUrl: true
              },
              take: 1
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '数字生命不存在' },
        { status: 404 }
      )
    }

    // 检查访问权限
    let user = null
    const token = getToken(request)
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        if (decoded && decoded.userId) {
          user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true }
          })
        }
      } catch (error) {
        // Token无效，用户为null
      }
    }
    
    // 检查是否为创建者
    const isCreator = user && user.id === digitalLife.creatorId
    
    // 如果是创建者，返回完整信息（包括用于编辑的数据）
    if (isCreator) {
      return NextResponse.json({
        success: true,
        digitalLife: {
          ...digitalLife,
          userId: digitalLife.creatorId // 添加用于权限检查
        }
      })
    }
    
    // 检查是否允许公开访问（用于聊天）
    const canPublicAccess = digitalLife.memorial.isPublic && digitalLife.allowPublicChat
    
    if (!canPublicAccess) {
      return NextResponse.json(
        { error: '无权限访问此数字生命' },
        { status: 403 }
      )
    }

    // 检查数字生命状态（公开访问时需要状态为READY）
    if (digitalLife.status !== 'READY') {
      return NextResponse.json(
        { error: '数字生命暂时不可用' },
        { status: 403 }
      )
    }

    // 返回公开访问的简化数据
    return NextResponse.json({
      success: true,
      digitalLife: {
        id: digitalLife.id,
        name: digitalLife.name,
        description: digitalLife.description,
        status: digitalLife.status,
        memorial: digitalLife.memorial,
        creator: digitalLife.creator
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

// PATCH - 更新数字生命
export async function PATCH(
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
    const { name, description, allowPublicUse, chatRecords } = await request.json()

    // 更新数字生命
    const updatedDigitalLife = await prisma.digitalLife.update({
      where: { id: digitalLifeId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(allowPublicUse !== undefined && { allowPublicUse }),
        ...(chatRecords && { chatRecords })
      },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      digitalLife: updatedDigitalLife
    })

  } catch (error: any) {
    console.error('更新数字生命失败:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '更新数字生命失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除数字生命
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
      where: { id: digitalLifeId },
      include: {
        conversations: true
      }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '数字生命不存在' },
        { status: 404 }
      )
    }

    if (digitalLife.creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: '您没有权限删除此数字生命' },
        { status: 403 }
      )
    }

    // 删除关联的对话记录
    await prisma.digitalLifeConversation.deleteMany({
      where: { digitalLifeId }
    })

    // 删除数字生命
    await prisma.digitalLife.delete({
      where: { id: digitalLifeId }
    })

    return NextResponse.json({
      success: true,
      message: '数字生命已删除'
    })

  } catch (error: any) {
    console.error('删除数字生命失败:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token无效或已过期' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '删除数字生命失败' },
      { status: 500 }
    )
  }
}