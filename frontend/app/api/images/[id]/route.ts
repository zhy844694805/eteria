import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateImageSchema = z.object({
  alt: z.string().max(200, 'Alt文本过长').optional(),
  caption: z.string().max(500, '图片描述过长').optional(),
  isPrimary: z.boolean().optional(),
})

// 获取单个图片详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const image = await prisma.memorialImage.findUnique({
      where: { id },
      include: {
        memorial: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      image
    })

  } catch (error) {
    console.error('Get image error:', error)
    return NextResponse.json(
      { error: '获取图片失败' },
      { status: 500 }
    )
  }
}

// 更新图片信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = updateImageSchema.parse(body)

    // 检查图片是否存在
    const existingImage = await prisma.memorialImage.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      )
    }

    // 如果设置为主图片，需要先将其他图片取消主图片状态
    if (validatedData.isPrimary && !existingImage.isPrimary) {
      await prisma.memorialImage.updateMany({
        where: {
          memorialId: existingImage.memorialId,
          isPrimary: true,
          id: {
            not: id
          }
        },
        data: {
          isPrimary: false
        }
      })
    }

    // 更新图片信息
    const updatedImage = await prisma.memorialImage.update({
      where: { id },
      data: validatedData,
      include: {
        memorial: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      image: updatedImage
    })

  } catch (error) {
    console.error('Update image error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新图片失败' },
      { status: 500 }
    )
  }
}

// 删除图片
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 检查图片是否存在
    const existingImage = await prisma.memorialImage.findUnique({
      where: { id }
    })

    if (!existingImage) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      )
    }

    // 删除图片记录
    await prisma.memorialImage.delete({
      where: { id }
    })

    // 如果删除的是主图片，需要将第一张图片设为主图片
    if (existingImage.isPrimary) {
      const firstImage = await prisma.memorialImage.findFirst({
        where: {
          memorialId: existingImage.memorialId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      if (firstImage) {
        await prisma.memorialImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '图片已删除'
    })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: '删除图片失败' },
      { status: 500 }
    )
  }
}