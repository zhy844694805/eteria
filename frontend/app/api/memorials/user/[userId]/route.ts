import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    const memorials = await prisma.memorial.findMany({
      where: {
        authorId: userId
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            isMain: true
          }
        },
        _count: {
          select: {
            messages: true,
            candles: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedMemorials = memorials.map(memorial => ({
      id: memorial.id,
      title: memorial.title,
      slug: memorial.slug,
      type: memorial.type,
      status: memorial.status,
      subjectName: memorial.subjectName,
      subjectType: memorial.subjectType,
      createdAt: memorial.createdAt.toISOString(),
      publishedAt: memorial.publishedAt?.toISOString(),
      viewCount: memorial.viewCount,
      messageCount: memorial._count.messages,
      candleCount: memorial._count.candles,
      likeCount: memorial._count.likes,
      images: memorial.images
    }))

    return NextResponse.json({
      memorials: formattedMemorials
    })

  } catch (error) {
    console.error('获取用户纪念页失败:', error)
    return NextResponse.json(
      { error: '获取用户纪念页失败' },
      { status: 500 }
    )
  }
}