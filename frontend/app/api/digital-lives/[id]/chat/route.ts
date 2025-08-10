import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// 获取token的通用函数
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return request.cookies.get('token')?.value || null
}

// 对话请求验证 schema
const chatSchema = z.object({
  message: z.string().min(1).max(500),
  userName: z.string().optional(),
  userEmail: z.string().email().optional()
})

// POST - 发送数字生命对话消息
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const digitalLifeId = resolvedParams.id
    
    // 验证请求数据
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // 获取可选的用户信息（匿名用户也可以对话）
    let user = null
    const token = getToken(request)
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        if (decoded && decoded.userId) {
          user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true }
          })
        }
      } catch (error) {
        // Token无效，用户为null
      }
    }

    // 获取数字生命信息
    const digitalLife = await prisma.digitalLife.findUnique({
      where: { id: digitalLifeId },
      include: {
        memorial: {
          select: {
            id: true,
            subjectName: true,
            isPublic: true
          }
        }
      }
    })

    if (!digitalLife) {
      return NextResponse.json(
        { error: '数字生命不存在' },
        { status: 404 }
      )
    }

    // 检查数字生命状态
    if (digitalLife.status !== 'READY') {
      return NextResponse.json(
        { error: '数字生命暂时不可用' },
        { status: 403 }
      )
    }

    // 检查权限：创建者或者公开对话
    const isCreator = user && user.id === digitalLife.creatorId
    const canPublicChat = digitalLife.memorial.isPublic && digitalLife.allowPublicChat
    
    if (!isCreator && !canPublicChat) {
      return NextResponse.json(
        { error: '数字生命不允许公开对话' },
        { status: 403 }
      )
    }

    // 解析聊天记录用于生成回复
    const chatRecords = JSON.parse(digitalLife.chatRecords || '[]')
    const chatContext = chatRecords
      .filter((record: any) => record.speaker === 'deceased')
      .map((record: any) => record.content)
      .join('\n')

    // 生成AI回复
    let aiResponse = '感谢您的话语，我在这里陪伴您。'
    
    try {
      // 调用AI API生成回复
      const llmResponse = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/ai/digital-life-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `基于以下逝者的聊天记录，以逝者的口吻和语言风格回复用户的消息。请保持逝者的个性特点和说话方式。

逝者的聊天记录：
${chatContext}

逝者姓名：${digitalLife.memorial.subjectName}
用户消息：${validatedData.message}

请以逝者的身份简短回复（不要加任何前缀，直接回复内容）：`,
          maxTokens: 300
        })
      })

      if (llmResponse.ok) {
        const llmData = await llmResponse.json()
        aiResponse = llmData.text || llmData.content || aiResponse
      }
    } catch (error) {
      console.error('AI回复生成失败:', error)
      // 使用默认回复
    }

    // 获取客户端IP和用户代理
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 创建对话记录
    const conversation = await prisma.digitalLifeConversation.create({
      data: {
        digitalLifeId: digitalLife.id,
        userMessage: validatedData.message,
        aiResponse: aiResponse,
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        ipAddress: clientIP,
        userAgent: userAgent,
        userId: user?.id
      }
    })

    // 更新数字生命的对话统计
    await prisma.digitalLife.update({
      where: { id: digitalLife.id },
      data: {
        conversationCount: {
          increment: 1
        },
        lastUsedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        userMessage: conversation.userMessage,
        aiResponse: conversation.aiResponse,
        createdAt: conversation.createdAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: error.errors },
        { status: 400 }
      )
    }

    console.error('数字生命对话失败:', error)
    return NextResponse.json(
      { error: '对话失败，请稍后重试' },
      { status: 500 }
    )
  }
}