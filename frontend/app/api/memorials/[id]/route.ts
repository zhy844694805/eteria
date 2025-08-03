import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemorialSchema = z.object({
  subjectName: z.string().min(1, '姓名不能为空').max(100, '姓名过长').optional(),
  subjectType: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  age: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  memories: z.string().nullable().optional(),
  personalityTraits: z.string().nullable().optional(),
  favoriteThings: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  // Pet-specific fields
  breed: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  // Human-specific fields
  relationship: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  // Creator information
  creatorName: z.string().min(1, '创建者姓名不能为空').max(50, '创建者姓名过长').optional(),
  creatorEmail: z.string().email('邮箱格式不正确').or(z.literal('')).nullable().optional(),
  creatorPhone: z.string().nullable().optional(),
  creatorRelation: z.string().nullable().optional(),
})

// 获取单个纪念页详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const memorial = await prisma.memorial.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        messages: {
          include: {
            user: {
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
            user: {
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
        tags: {
          include: {
            tag: true
          }
        },
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
        viewCount: {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    if (validatedData.birthDate !== undefined) {
      updateData.birthDate = validatedData.birthDate ? new Date(validatedData.birthDate) : null
    }
    if (validatedData.deathDate !== undefined) {
      updateData.deathDate = validatedData.deathDate ? new Date(validatedData.deathDate) : null
    }

    // 更新纪念页
    const updatedMemorial = await prisma.memorial.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        messages: {
          include: {
            user: {
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
            user: {
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
        tags: {
          include: {
            tag: true
          }
        },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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