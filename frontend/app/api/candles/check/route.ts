import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkCandleSchema = z.object({
  memorialId: z.string().min(1, '纪念页ID不能为空'),
  userId: z.string().optional(),
})

// 检查今日是否已点过蜡烛
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkCandleSchema.parse(body)

    // 检查今日是否已经点过蜡烛
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // 构建查询条件 - 检查同一用户或同一IP是否今天已点过蜡烛
    const existingCandleWhere: any = {
      memorialId: validatedData.memorialId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }

    if (validatedData.userId) {
      // 已登录用户：检查用户ID
      existingCandleWhere.userId = validatedData.userId
    } else {
      // 未登录用户：检查IP地址
      existingCandleWhere.ipAddress = clientIP
    }

    const existingCandle = await prisma.candle.findFirst({
      where: existingCandleWhere
    })

    return NextResponse.json({
      success: true,
      canLight: !existingCandle,
      message: existingCandle ? '今天已经点过蜡烛了' : '可以点蜡烛'
    })

  } catch (error) {
    console.error('Check candle error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '检查点蜡烛状态失败' },
      { status: 500 }
    )
  }
}