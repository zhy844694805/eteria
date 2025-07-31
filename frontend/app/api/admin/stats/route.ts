import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/admin-auth'

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 并行查询所有统计数据
    const [
      userStats,
      newUsersToday,
      newUsersThisWeek,
      memorialStats,
      newMemorialsToday,
      petMemorials,
      humanMemorials,
      publishedMemorials,
      pendingMemorials,
      messageCount,
      candleCount,
      likeCount,
      imageCount,
      reviewStats
    ] = await Promise.all([
      // 用户统计
      prisma.user.groupBy({
        by: ['isActive', 'isBanned'],
        _count: true
      }),
      
      // 今日新用户
      prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      
      // 本周新用户
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),
      
      // 纪念页统计
      prisma.memorial.count(),
      
      // 今日新纪念页
      prisma.memorial.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      
      // 宠物纪念页
      prisma.memorial.count({
        where: {
          type: 'PET'
        }
      }),
      
      // 人类纪念页
      prisma.memorial.count({
        where: {
          type: 'HUMAN'
        }
      }),
      
      // 已发布纪念页
      prisma.memorial.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      
      // 待审核纪念页
      prisma.memorial.count({
        where: {
          status: 'DRAFT'
        }
      }),
      
      // 留言数量
      prisma.message.count(),
      
      // 蜡烛数量
      prisma.candle.count(),
      
      // 点赞数量
      prisma.like.count(),
      
      // 图片数量
      prisma.memorialImage.count(),
      
      // 审核统计
      prisma.contentReview.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    // 处理用户统计数据
    let totalUsers = 0
    let activeUsers = 0
    let bannedUsers = 0
    
    userStats.forEach(stat => {
      totalUsers += stat._count
      if (stat.isActive && !stat.isBanned) {
        activeUsers += stat._count
      }
      if (stat.isBanned) {
        bannedUsers += stat._count
      }
    })

    // 处理审核统计数据
    let pendingReviews = 0
    let approvedReviews = 0
    let rejectedReviews = 0
    
    reviewStats.forEach(stat => {
      switch (stat.status) {
        case 'PENDING':
          pendingReviews += stat._count
          break
        case 'APPROVED':
          approvedReviews += stat._count
          break
        case 'REJECTED':
          rejectedReviews += stat._count
          break
      }
    })

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek
      },
      memorials: {
        total: memorialStats,
        published: publishedMemorials,
        pending: pendingMemorials,
        pet: petMemorials,
        human: humanMemorials,
        newToday: newMemorialsToday
      },
      content: {
        messages: messageCount,
        candles: candleCount,
        likes: likeCount,
        images: imageCount
      },
      reviews: {
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取管理员统计数据失败:', error)
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}, 'MODERATOR')