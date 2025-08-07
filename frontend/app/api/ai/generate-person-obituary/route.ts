import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const generatePersonObituarySchema = z.object({
  personName: z.string().min(1, '姓名不能为空'),
  relationship: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  age: z.string().optional(),
  birthDate: z.string().optional(),
  passingDate: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  specialMemory: z.string().optional(),
})

const OPENAI_API_KEY = 'sk-dgKbgYexmIWUuHeJDdC0Cf2cB621478a845c050b17906825'
const OPENAI_API_BASE = 'https://oneapi.maiduoduo.it'
const MODEL_NAME = 'Woka1.5-14B'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('AI生成人员纪念请求数据:', body)
    
    // 验证输入数据
    const validatedData = generatePersonObituarySchema.parse(body)
    
    // 构建AI生成的提示词
    const prompt = buildPersonPrompt(validatedData)
    console.log('构建的人员纪念提示词:', prompt)
    
    // 调用OpenAI API
    const aiResponse = await callOpenAIAPI(prompt)
    
    return NextResponse.json({
      success: true,
      content: aiResponse,
      prompt: prompt // 用于调试
    })
    
  } catch (error) {
    console.error('AI生成人员纪念错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '输入数据有误' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'AI生成失败，请重试' },
      { status: 500 }
    )
  }
}

function buildPersonPrompt(data: z.infer<typeof generatePersonObituarySchema>): string {
  const {
    personName,
    relationship,
    occupation,
    location,
    age,
    birthDate,
    passingDate,
    personalityTraits,
    achievements,
    hobbies,
    specialMemory
  } = data

  // 转换特征和成就为中文描述
  const personalityText = personalityTraits && personalityTraits.length > 0 
    ? personalityTraits.join('、') 
    : ''
  
  const achievementText = achievements && achievements.length > 0
    ? achievements.join('、')
    : ''

  const hobbyText = hobbies && hobbies.length > 0
    ? hobbies.join('、')
    : ''

  // 构建详细的提示词
  let prompt = `请为一位名叫"${personName}"的逝者写一篇温馨感人的纪念文案。

逝者信息：
- 姓名：${personName}`

  if (relationship) {
    prompt += `\n- 关系：${translateRelationship(relationship)}`
  }
  
  if (occupation) {
    prompt += `\n- 职业：${occupation}`
  }
  
  if (location) {
    prompt += `\n- 祖籍：${location}`
  }

  if (age) {
    prompt += `\n- 年龄：${age}岁`
  }
  
  if (birthDate) {
    prompt += `\n- 出生日期：${birthDate}`
  }
  
  if (passingDate) {
    prompt += `\n- 去世日期：${passingDate}`
  }

  if (personalityText) {
    prompt += `\n- 性格特点：${personalityText}`
  }

  if (achievementText) {
    prompt += `\n- 人生成就：${achievementText}`
  }

  if (hobbyText) {
    prompt += `\n- 兴趣爱好：${hobbyText}`
  }

  if (specialMemory) {
    prompt += `\n- 特别回忆：${specialMemory}`
  }

  prompt += `

请写一篇300-500字的温馨纪念文案，要求：
1. 语调庄重而温暖，充满对逝者的敬意和怀念
2. 突出${personName}的人格魅力和人生贡献
3. 体现逝者与家人朋友之间的深厚情谊
4. 以积极正面的方式纪念${personName}的一生
5. 文案应该让读者感受到${personName}留给世界的美好影响
6. 适当体现逝者的人生哲学和生活态度

请直接输出纪念文案内容，不要添加其他说明文字。`

  return prompt
}

// 翻译关系
function translateRelationship(relationship: string): string {
  const relationshipTranslations: Record<string, string> = {
    'parent': '父母',
    'spouse': '配偶',
    'child': '子女', 
    'sibling': '兄弟姐妹',
    'relative': '亲戚',
    'friend': '朋友',
    'colleague': '同事',
    'other': '其他'
  }
  
  return relationshipTranslations[relationship] || relationship
}

async function callOpenAIAPI(prompt: string): Promise<string> {
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
            content: '你是一个专业的逝者纪念文案写手，擅长写庄重温馨的纪念文字。你的文案总是充满敬意和温暖，能够抚慰失去亲人的家属的心灵，同时弘扬逝者的美好品德和人生价值。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
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