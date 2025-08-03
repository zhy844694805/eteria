import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  memorialId: z.string(),
  imageOrders: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { memorialId, imageOrders } = reorderSchema.parse(body)

    // 验证纪念页存在
    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 批量更新图片排序
    await Promise.all(
      imageOrders.map(({ id, order }) =>
        prisma.memorialImage.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: '图片排序更新成功'
    })

  } catch (error) {
    console.error('Reorder images error:', error)
    return NextResponse.json(
      { error: '更新图片排序失败' },
      { status: 500 }
    )
  }
}