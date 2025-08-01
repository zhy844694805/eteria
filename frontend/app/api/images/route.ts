import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createImageSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  url: z.string().min(1, '图片URL不能为空'),
  filename: z.string().min(1, '文件名不能为空'),
  originalName: z.string().min(1, '原始文件名不能为空'),
  mimeType: z.string().min(1, '文件类型不能为空'),
  size: z.number().min(1, '文件大小必须大于0'),
  alt: z.string().max(200, 'Alt文本过长').optional(),
  caption: z.string().max(500, '图片描述过长').optional(),
  isMain: z.boolean().optional().default(false),
})

const querySchema = z.object({
  memorialId: z.string().optional(),
  isMain: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

// 上传图片记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = createImageSchema.parse(body)

    // 验证纪念页是否存在
    const memorial = await prisma.memorial.findUnique({
      where: { id: validatedData.memorialId }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 400 }
      )
    }

    // 如果设置为主图片，需要先将其他图片取消主图片状态
    if (validatedData.isMain) {
      await prisma.memorialImage.updateMany({
        where: {
          memorialId: validatedData.memorialId,
          isMain: true
        },
        data: {
          isMain: false
        }
      })
    }

    // 创建图片记录
    const image = await prisma.memorialImage.create({
      data: validatedData,
      include: {
        memorial: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      image
    })

  } catch (error) {
    console.error('Create image error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '上传图片失败' },
      { status: 500 }
    )
  }
}

// 获取图片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = querySchema.parse({
      memorialId: searchParams.get('memorialId'),
      isPrimary: searchParams.get('isPrimary'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const page = parseInt(queryData.page || '1')
    const limit = parseInt(queryData.limit || '20')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (queryData.memorialId) {
      where.memorialId = queryData.memorialId
    }
    
    if (queryData.isMain) {
      where.isMain = queryData.isMain === 'true'
    }

    // 获取图片列表
    const [images, total] = await Promise.all([
      prisma.memorialImage.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isMain: 'desc' },
          { createdAt: 'asc' }
        ],
        include: {
          memorial: {
            select: {
              id: true,
              title: true,
              type: true,
            }
          }
        }
      }),
      prisma.memorialImage.count({ where })
    ])

    return NextResponse.json({
      success: true,
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get images error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '查询参数有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取图片列表失败' },
      { status: 500 }
    )
  }
}