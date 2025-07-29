import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemorialSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(100, '姓名过长').optional(),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
  lifeStory: z.string().optional(),
  isPublic: z.boolean().optional(),
  // Pet-specific fields
  petType: z.string().optional(),
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  // Human-specific fields
  relationship: z.enum(['PARENT', 'SPOUSE', 'CHILD', 'SIBLING', 'RELATIVE', 'FRIEND', 'COLLEAGUE', 'OTHER']).optional(),
  age: z.number().min(0).max(150).optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  // Creator information
  creatorName: z.string().min(1, '创建者姓名不能为空').max(50, '创建者姓名过长').optional(),
  creatorEmail: z.string().email('邮箱格式不正确').optional(),
  creatorPhone: z.string().optional(),
})

// 获取单个纪念页详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const memorial = await prisma.memorial.findUnique({
      where: { id },
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
      where: { id },
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
    console.error('Get memorial error:', error)
    return NextResponse.json(
      { error: '获取纪念页失败' },
      { status: 500 }
    )
  }
}

// 更新纪念页
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = updateMemorialSchema.parse(body)

    // 检查纪念页是否存在
    const existingMemorial = await prisma.memorial.findUnique({
      where: { id }
    })

    if (!existingMemorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 处理日期字段
    const updateData: any = { ...validatedData }
    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null
    }
    if (validatedData.dateOfDeath !== undefined) {
      updateData.dateOfDeath = validatedData.dateOfDeath ? new Date(validatedData.dateOfDeath) : null
    }

    // 更新纪念页
    const updatedMemorial = await prisma.memorial.update({
      where: { id },
      data: updateData,
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
        likes: true,
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

    return NextResponse.json({
      success: true,
      memorial: updatedMemorial
    })

  } catch (error) {
    console.error('Update memorial error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新纪念页失败' },
      { status: 500 }
    )
  }
}

// 删除纪念页
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 检查纪念页是否存在
    const existingMemorial = await prisma.memorial.findUnique({
      where: { id }
    })

    if (!existingMemorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 删除纪念页（会级联删除相关的图片、留言、蜡烛、点赞、标签等）
    await prisma.memorial.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '纪念页已删除'
    })

  } catch (error) {
    console.error('Delete memorial error:', error)
    return NextResponse.json(
      { error: '删除纪念页失败' },
      { status: 500 }
    )
  }
}