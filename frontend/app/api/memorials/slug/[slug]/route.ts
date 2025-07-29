import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 通过slug获取纪念页详情
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const memorial = await prisma.memorial.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        messages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        candles: {
          include: {
            lighter: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        tags: true,
        _count: {
          select: {
            messages: true,
            candles: true,
            likes: true,
          }
        }
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 增加浏览次数
    await prisma.memorial.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      memorial
    })

  } catch (error) {
    console.error('Get memorial by slug error:', error)
    return NextResponse.json(
      { error: '获取纪念页失败' },
      { status: 500 }
    )
  }
}