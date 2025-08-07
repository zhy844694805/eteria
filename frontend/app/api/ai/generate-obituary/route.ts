import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const generateObituarySchema = z.object({
  petName: z.string().min(1, '宠物名字不能为空'),
  petType: z.string().min(1, '宠物类型不能为空'),
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(),
  favoriteActivities: z.array(z.string()).optional(),
  specialMemory: z.string().optional(),
})

const OPENAI_API_KEY = 'sk-dgKbgYexmIWUuHeJDdC0Cf2cB621478a845c050b17906825'
const OPENAI_API_BASE = 'https://oneapi.maiduoduo.it'
const MODEL_NAME = 'Woka1.5-14B'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('AI生成请求数据:', body)
    
    // 验证输入数据
    const validatedData = generateObituarySchema.parse(body)
    
    // 构建AI生成的提示词
    const prompt = buildPrompt(validatedData)
    console.log('构建的提示词:', prompt)
    
    // 调用OpenAI API
    const aiResponse = await callOpenAIAPI(prompt)
    
    return NextResponse.json({
      success: true,
      content: aiResponse,
      prompt: prompt // 用于调试
    })
    
  } catch (error) {
    console.error('AI生成错误:', error)
    
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

function buildPrompt(data: z.infer<typeof generateObituarySchema>): string {
  const {
    petName,
    petType,
    breed,
    color,
    gender,
    birthDate,
    deathDate,
    personalityTraits,
    favoriteActivities,
    specialMemory
  } = data

  // 转换性格特征和爱好为中文描述
  const personalityText = personalityTraits && personalityTraits.length > 0 
    ? personalityTraits.join('、') 
    : ''
  
  const activitiesText = favoriteActivities && favoriteActivities.length > 0
    ? favoriteActivities.join('、')
    : ''

  // 构建详细的提示词
  let prompt = `请为一只名叫"${petName}"的${getAnimalNameInChinese(petType)}写一篇温馨感人的纪念文案。

宠物信息：
- 名字：${petName}
- 类型：${getAnimalNameInChinese(petType)}`

  if (breed) {
    prompt += `\n- 品种：${getBreedInChinese(breed)}`
  }
  
  if (color) {
    prompt += `\n- 颜色：${getColorInChinese(color)}`
  }
  
  if (gender) {
    prompt += `\n- 性别：${gender === 'male' ? '男孩' : gender === 'female' ? '女孩' : gender}`
  }
  
  if (birthDate) {
    prompt += `\n- 出生日期：${birthDate}`
  }
  
  if (deathDate) {
    prompt += `\n- 离世日期：${deathDate}`
  }

  if (personalityText) {
    prompt += `\n- 性格特点：${personalityText}`
  }

  if (activitiesText) {
    prompt += `\n- 喜欢的活动：${activitiesText}`
  }

  if (specialMemory) {
    prompt += `\n- 特别回忆：${specialMemory}`
  }

  prompt += `

请写一篇200-400字的温馨纪念文案，要求：
1. 语调温暖、充满爱意，避免过度悲伤
2. 突出${petName}的个性特点和美好回忆
3. 体现主人与宠物之间的深厚感情
4. 以积极正面的方式纪念${petName}的一生
5. 文案应该让读者感受到${petName}带来的快乐和温暖

请直接输出纪念文案内容，不要添加其他说明文字。`

  return prompt
}

function getAnimalNameInChinese(petType: string): string {
  const animalNames: Record<string, string> = {
    'dog': '狗狗',
    'cat': '猫咪',
    'bird': '鸟儿',
    'rabbit': '兔子',
    'hamster': '仓鼠',
    'guinea-pig': '豚鼠',
    'other': '宠物'
  }
  return animalNames[petType] || petType
}

// 翻译品种名称
function getBreedInChinese(breed: string): string {
  const breedTranslations: Record<string, string> = {
    // 狗类品种
    'labrador': '拉布拉多',
    'golden-retriever': '金毛寻回犬',
    'german-shepherd': '德国牧羊犬',
    'bulldog': '斗牛犬',
    'poodle': '贵宾犬',
    'husky': '哈士奇',
    'chihuahua': '吉娃娃',
    'shiba': '柴犬',
    'shiba-inu': '柴犬',
    'corgi': '柯基',
    'beagle': '比格犬',
    'border-collie': '边境牧羊犬',
    'rottweiler': '罗威纳',
    'yorkshire-terrier': '约克夏梗',
    'dachshund': '腊肠犬',
    'boxer': '拳师犬',
    'australian-shepherd': '澳洲牧羊犬',
    'siberian-husky': '西伯利亚雪橇犬',
    'great-dane': '大丹犬',
    'pomeranian': '博美',
    'shih-tzu': '西施犬',
    'boston-terrier': '波士顿梗',
    'bernese-mountain-dog': '伯恩山犬',
    'french-bulldog': '法国斗牛犬',
    'cocker-spaniel': '可卡犬',
    'maltese': '马尔济斯',
    'samoyed': '萨摩耶',
    
    // 猫类品种
    'persian': '波斯猫',
    'maine-coon': '缅因猫',
    'siamese': '暹罗猫',
    'ragdoll': '布偶猫',
    'british-shorthair': '英国短毛猫',
    'american-shorthair': '美国短毛猫',
    'scottish-fold': '苏格兰折耳猫',
    'russian-blue': '俄罗斯蓝猫',
    'bengal': '孟加拉猫',
    'abyssinian': '阿比西尼亚猫',
    'birman': '伯曼猫',
    'exotic-shorthair': '异国短毛猫',
    'norwegian-forest': '挪威森林猫',
    'sphynx': '斯芬克斯猫',
    'oriental-shorthair': '东方短毛猫',
    'devon-rex': '德文卷毛猫',
    'turkish-angora': '土耳其安哥拉猫',
    'munchkin': '曼基康猫',
    'domestic-shorthair': '家养短毛猫',
    'domestic-longhair': '家养长毛猫',
    
    // 鸟类品种
    'canary': '金丝雀',
    'budgerigar': '虎皮鹦鹉',
    'cockatiel': '玄凤鹦鹉',
    'lovebird': '爱情鸟',
    'macaw': '金刚鹦鹉',
    'african-grey': '非洲灰鹦鹉',
    'cockatoo': '凤头鹦鹉',
    'conure': '锥尾鹦鹉',
    'finch': '雀',
    'parakeet': '长尾小鹦鹉',
    
    // 兔子品种
    'holland-lop': '荷兰垂耳兔',
    'netherland-dwarf': '荷兰侏儒兔',
    'lionhead': '狮子头兔',
    'angora': '安哥拉兔',
    'mini-rex': '迷你雷克斯兔',
    'flemish-giant': '佛兰德巨兔',
    
    // 仓鼠品种
    'golden': '金丝熊',
    'dwarf': '侏儒仓鼠',
    'chinese': '中国仓鼠',
    'roborovski': '罗伯罗夫斯基仓鼠',
    
    // 豚鼠品种
    'american': '美国豚鼠',
    'peruvian': '秘鲁豚鼠',
    'abyssinian': '阿比西尼亚豚鼠',
    'skinny': '无毛豚鼠',
    
    // 通用
    'mixed': '混种',
    'unknown': '不确定',
    'other': '其他'
  }
  
  return breedTranslations[breed] || breed
}

// 翻译颜色
function getColorInChinese(color: string): string {
  const colorTranslations: Record<string, string> = {
    'black': '黑色',
    'white': '白色',
    'brown': '棕色',
    'gray': '灰色',
    'golden': '金色',
    'yellow': '黄色',
    'orange': '橙色',
    'red': '红色',
    'cream': '奶油色',
    'tan': '棕褐色',
    'silver': '银色',
    'blue': '蓝色',
    'chocolate': '巧克力色',
    'caramel': '焦糖色',
    'black-white': '黑白相间',
    'brown-white': '棕白相间',
    'gray-white': '灰白相间',
    'tabby': '虎斑色',
    'tricolor': '三色',
    'multicolor': '多种颜色'
  }
  
  return colorTranslations[color] || color
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
            content: '你是一个专业的宠物纪念文案写手，擅长写温馨感人的纪念文字。你的文案总是充满爱意和温暖，能够抚慰失去宠物的主人的心灵。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
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