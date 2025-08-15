import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-auth'

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // 获取最近的用户注册
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 4),
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // 获取最近的纪念页创建
    const recentMemorials = await prisma.memorial.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 4),
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // 获取最近的留言
    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 4),
      include: {
        memorial: {
          select: {
            subjectName: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // 获取最近的蜡烛点亮
    const recentCandles = await prisma.candle.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 4),
      include: {
        memorial: {
          select: {
            subjectName: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // 合并并格式化活动数据
    const activities = [
      // 用户注册活动
      ...recentUsers.map(user => ({
        id: `user_${user.id}`,
        type: 'USER_REGISTER' as const,
        user: {
          name: user.name,
          email: user.email
        },
        description: `新用户注册`,
        createdAt: user.createdAt.toISOString()
      })),
      
      // 纪念页创建活动
      ...recentMemorials.map(memorial => ({
        id: `memorial_${memorial.id}`,
        type: 'MEMORIAL_CREATE' as const,
        user: {
          name: memorial.author.name,
          email: memorial.author.email
        },
        description: `创建了 "${memorial.subjectName}" 的逝者纪念页`,
        createdAt: memorial.createdAt.toISOString()
      })),
      
      // 留言活动
      ...recentMessages.map(message => ({
        id: `message_${message.id}`,
        type: 'MESSAGE_POST' as const,
        user: {
          name: message.user?.name || message.authorName,
          email: message.user?.email || message.authorEmail || ''
        },
        description: `在 "${message.memorial.subjectName}" 的纪念页留言`,
        createdAt: message.createdAt.toISOString()
      })),
      
      // 点烛活动
      ...recentCandles.map(candle => ({
        id: `candle_${candle.id}`,
        type: 'CANDLE_LIGHT' as const,
        user: {
          name: candle.user?.name || candle.lightedBy,
          email: candle.user?.email || candle.email || ''
        },
        description: `为 "${candle.memorial.subjectName}" 点亮了蜡烛`,
        createdAt: candle.createdAt.toISOString()
      }))
    ]

    // 按时间排序并限制数量
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      total: activities.length
    })
  } catch (error) {
    console.error('获取最近活动失败:', error)
    return NextResponse.json(
      { error: '获取活动数据失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')