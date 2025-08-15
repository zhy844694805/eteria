import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { verifyToken } from '@/lib/auth-db' // verifyToken不存在

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const digitalLifeId = resolvedParams.id
    
    console.log('Debug: 收到请求，数字生命ID:', digitalLifeId)
    
    // 测试数据库连接
    const count = await prisma.digitalLife.count()
    console.log('Debug: 数据库中的数字生命总数:', count)
    
    // 获取数字生命信息
    const digitalLife = await prisma.digitalLife.findUnique({
      where: { id: digitalLifeId }
    })
    
    console.log('Debug: 查询结果:', digitalLife)
    
    // 获取用户信息（verifyToken函数不存在，跳过）
    // const user = await verifyToken(request).catch((error) => {
    //   console.log('Debug: Token验证失败:', error.message)
    //   return null
    // })
    const user: { id: string } | null = null
    
    console.log('Debug: 用户信息跳过验证')
    
    return NextResponse.json({
      success: true,
      debug: {
        digitalLifeId,
        digitalLifeFound: !!digitalLife,
        digitalLifeStatus: digitalLife?.status,
        userFound: false,
        userId: null,
        totalCount: count
      }
    })
    
  } catch (error) {
    console.error('Debug API错误:', error)
    return NextResponse.json({
      error: '调试失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}