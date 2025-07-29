import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const migrateSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  type: z.enum(['user', 'obituaries', 'all']).optional().default('all'),
})

// 数据迁移API端点
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入数据
    const validatedData = migrateSchema.parse(body)
    const { userId, type } = validatedData

    // 验证用户是否存在
    const userResponse = await fetch(`${request.nextUrl.origin}/api/users/${userId}`)
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    const results: any = {
      user: null,
      obituaries: null,
      success: true,
      message: ''
    }

    // 由于这是服务端API，无法直接访问localStorage
    // 客户端需要将localStorage数据发送到这个端点
    return NextResponse.json({
      success: false,
      error: '数据迁移需要在客户端执行，请使用前端迁移服务'
    })

  } catch (error) {
    console.error('Migration API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '数据迁移失败' },
      { status: 500 }
    )
  }
}