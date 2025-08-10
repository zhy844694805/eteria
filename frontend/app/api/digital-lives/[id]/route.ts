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
    
    // 检查是否为创建者或者允许公开访问
    const isCreator = user && user.id === digitalLife.creatorId
    const canPublicAccess = digitalLife.memorial.isPublic && digitalLife.allowPublicChat
    
    if (!isCreator && !canPublicAccess) {
      return NextResponse.json(
        { error: '无权限访问此数字生命' },
        { status: 403 }
      )
    }

    // 检查数字生命状态
    if (digitalLife.status !== 'READY') {
      return NextResponse.json(
        { error: '数字生命暂时不可用' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      digitalLife
    })

  } catch (error) {
    console.error('获取数字生命失败:', error)
    return NextResponse.json(
      { error: '获取数字生命失败' },
      { status: 500 }
    )
  }
}