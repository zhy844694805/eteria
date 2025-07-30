import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemorialSchema = z.object({
  subjectName: z.string().min(1, '姓名不能为空').max(100, '姓名过长').optional(),
  subjectType: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  age: z.string().optional(),
  story: z.string().optional(),
  memories: z.string().optional(),
  personalityTraits: z.string().optional(),
  favoriteThings: z.string().optional(),
  isPublic: z.boolean().optional(),
  // Pet-specific fields
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  // Human-specific fields
  relationship: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  // Creator information
  creatorName: z.string().min(1, '创建者姓名不能为空').max(50, '创建者姓名过长').optional(),
  creatorEmail: z.string().email('邮箱格式不正确').optional(),
  creatorPhone: z.string().optional(),
  creatorRelation: z.string().optional(),
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