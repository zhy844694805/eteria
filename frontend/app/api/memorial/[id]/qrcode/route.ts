import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memorialId = params.id

    // 获取纪念页信息
    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
      select: {
        slug: true,
        type: true,
        subjectName: true,
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

    // 构建纪念页URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const memorialPath = memorial.type === 'PET' 
      ? 'community-pet-obituaries' 
      : 'community-person-obituaries'
    const memorialUrl = `${baseUrl}/${memorialPath}/${memorial.slug}`

    // 生成二维码
    const qrCodeDataURL = await QRCode.toDataURL(memorialUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })

    // 更新二维码查看统计
    await prisma.memorial.update({
      where: { id: memorialId },
      data: {
        qrCodeViewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      url: memorialUrl,
      memorial: {
        name: memorial.subjectName,
        type: memorial.type
      }
    })

  } catch (error) {
    console.error('Generate QR code error:', error)
    return NextResponse.json(
      { error: '生成二维码失败' },
      { status: 500 }
    )
  }
}