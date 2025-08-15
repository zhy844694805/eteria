import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shareActionSchema = z.object({
  action: z.enum(['share', 'copyLink', 'viewQR']),
  platform: z.string().optional() // 分享平台，如 'wechat', 'weibo', 'qq' 等
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params
    const body = await request.json()
    const { action, platform } = shareActionSchema.parse(body)

    // 验证纪念页是否存在
    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
      select: {
        id: true,
        isPublic: true,
        status: true
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    if (!memorial.isPublic || memorial.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: '纪念页不可访问' },
        { status: 403 }
      )
    }

    // 根据操作类型更新统计
    const updateData: any = {}
    
    switch (action) {
      case 'share':
        updateData.shareCount = { increment: 1 }
        break
      case 'copyLink':
        updateData.linkCopyCount = { increment: 1 }
        break
      case 'viewQR':
        updateData.qrCodeViewCount = { increment: 1 }
        break
    }

    await prisma.memorial.update({
      where: { id: memorialId },
      data: updateData
    })

    // 记录分享操作（可选：用于详细分析）
    console.log(`Memorial ${memorialId} - ${action}${platform ? ` via ${platform}` : ''}`)

    return NextResponse.json({
      success: true,
      message: '统计已更新'
    })

  } catch (error) {
    console.error('Share tracking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '参数错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '记录分享统计失败' },
      { status: 500 }
    )
  }
}

// 获取分享统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memorialId } = await params

    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
      select: {
        shareCount: true,
        linkCopyCount: true,
        qrCodeViewCount: true,
        viewCount: true
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stats: {
        shareCount: memorial.shareCount,
        linkCopyCount: memorial.linkCopyCount,
        qrCodeViewCount: memorial.qrCodeViewCount,
        viewCount: memorial.viewCount,
        totalShares: memorial.shareCount + memorial.linkCopyCount + memorial.qrCodeViewCount
      }
    })

  } catch (error) {
    console.error('Get share stats error:', error)
    return NextResponse.json(
      { error: '获取分享统计失败' },
      { status: 500 }
    )
  }
}