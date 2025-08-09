import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const digitalLifeChatSchema = z.object({
  prompt: z.string().min(1, '对话内容不能为空'),
  maxTokens: z.number().optional().default(500)
})

const OPENAI_API_KEY = 'sk-dgKbgYexmIWUuHeJDdC0Cf2cB621478a845c050b17906825'
const OPENAI_API_BASE = 'https://oneapi.maiduoduo.it'
const MODEL_NAME = 'Woka1.5-14B'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('数字生命对话请求数据:', body)
    
    // 验证输入数据
    const validatedData = digitalLifeChatSchema.parse(body)
    
    console.log('验证后的对话提示词:', validatedData.prompt)
    
    // 调用OpenAI API
    const aiResponse = await callOpenAIAPI(validatedData.prompt, validatedData.maxTokens)
    
    return NextResponse.json({
      success: true,
      text: aiResponse,
      content: aiResponse // 保持兼容性
    })
    
  } catch (error) {
    console.error('数字生命对话错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '数字生命对话失败，请重试' },
      { status: 500 }
    )
  }
}

async function callOpenAIAPI(prompt: string, maxTokens: number): Promise<string> {
  try {
    const response = await fetch(`${OPENAI_API_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: '你是一个数字生命AI，能够模拟逝者的语言风格和个性特点进行对话。你需要基于提供的聊天记录来学习逝者的说话方式，然后以逝者的身份进行真实自然的对话。请保持逝者的语言习惯、情感表达和个性特征。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API错误响应:', response.status, errorText)
      throw new Error(`OpenAI API请求失败: ${response.status}`)
    }

    const result = await response.json()
    console.log('OpenAI API响应:', result)

    if (result.choices && result.choices.length > 0) {
      return result.choices[0].message.content.trim()
    } else {
      throw new Error('OpenAI API返回了空内容')
    }
    
  } catch (error) {
    console.error('调用OpenAI API失败:', error)
    throw error
  }
}

export const dynamic = 'force-dynamic'