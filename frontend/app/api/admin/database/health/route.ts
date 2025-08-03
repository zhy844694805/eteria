import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db-monitor'

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '此接口仅在开发环境可用' },
        { status: 403 }
      )
    }

    const health = await checkDatabaseHealth()
    
    return NextResponse.json({
      success: true,
      health
    })
  } catch (error) {
    console.error('Database health check error:', error)
    return NextResponse.json(
      { error: '数据库健康检查失败' },
      { status: 500 }
    )
  }
}