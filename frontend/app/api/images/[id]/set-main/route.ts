import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params

    // 查找图片及其所属纪念页
    const image = await prisma.memorialImage.findUnique({
      where: { id: imageId },
      include: { memorial: true }
    })

    if (!image) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      )
    }

    // 先将该纪念页的所有图片设为非主图
    await prisma.memorialImage.updateMany({
      where: { memorialId: image.memorialId },
      data: { isMain: false }
    })

    // 将指定图片设为主图
    await prisma.memorialImage.update({
      where: { id: imageId },
      data: { isMain: true }
    })

    return NextResponse.json({
      success: true,
      message: '主图片设置成功'
    })

  } catch (error) {
    console.error('Set main image error:', error)
    return NextResponse.json(
      { error: '设置主图片失败' },
      { status: 500 }
    )
  }
}