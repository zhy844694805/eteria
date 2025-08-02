import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMessageSchema = z.object({
  content: z.string().min(1, '留言内容不能为空').max(1000, '留言过长').optional(),
  isAnonymous: z.boolean().optional(),
})

// 获取单个留言详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        },
        memorial: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json(
        { error: '留言不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Get message error:', error)
    return NextResponse.json(
      { error: '获取留言失败' },
      { status: 500 }
    )
  }
}

// 更新留言
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = updateMessageSchema.parse(body)

    // 检查留言是否存在
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: '留言不存在' },
        { status: 404 }
      )
    }

    // 更新留言
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        },
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
      message: updatedMessage
    })

  } catch (error) {
    console.error('Update message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新留言失败' },
      { status: 500 }
    )
  }
}

// 删除留言
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const { id } = await params

    // 检查留言是否存在
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: '留言不存在' },
        { status: 404 }
      )
    }

    // 删除留言
    await prisma.message.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '留言已删除'
    })

  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json(
      { error: '删除留言失败' },
      { status: 500 }
    )
  }
}