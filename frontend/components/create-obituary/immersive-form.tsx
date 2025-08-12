"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { CircleDot, Circle, Dog, Cat, Bird, Rabbit, Mouse, Footprints } from 'lucide-react'

interface ImmersiveFormProps {
  initialData?: any
}

interface FormData {
  petName: string
  petType: string
  breed: string
  color: string
  gender: string
  birthDate: string
  passingDate: string
  photos: File[] // 合并主图和多图为统一的照片数组
  contentChoice: string // 'ai-generated' 或 'self-written'
  personality: string[]
  favoriteActivities: string[]
  specialMemory: string
  accountChoice: string // 'register' 或 'guest' (仅未登录用户)
  creatorName: string
}

export function ImmersiveForm({ initialData }: ImmersiveFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [answers, setAnswers] = useState<FormData>({
    petName: "",
    petType: "",
    breed: "",
    color: "",
    gender: "",
    birthDate: "",
    passingDate: "",
    photos: [],
    contentChoice: "",
    personality: [],
    favoriteActivities: [],
    specialMemory: "",
    accountChoice: "",
    creatorName: user?.name || ""
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; index: number } | null>(null)
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // 恢复保存的表单数据
  useEffect(() => {
    if (initialData) {
      setAnswers(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // 动态生成问题列表
  const getQuestions = () => {
    const baseQuestions = [
      {
        id: 'petName',
        type: 'text',
        question: '它叫什么名字？',
        placeholder: '输入名字...',
        required: true
      },
      {
        id: 'petType',
        type: 'options',
        question: `很好听的名字！${answers.petName}是什么动物呢？`,
        options: [
          { value: 'dog', label: '狗狗', icon: Dog },
          { value: 'cat', label: '猫咪', icon: Cat },
          { value: 'bird', label: '鸟儿', icon: Bird },
          { value: 'rabbit', label: '兔子', icon: Rabbit },
          { value: 'hamster', label: '仓鼠', icon: Mouse },
          { value: 'guinea-pig', label: '豚鼠', icon: Mouse },
          { value: 'other', label: '其他', icon: Footprints }
        ],
        required: true
      },
      {
        id: 'breed',
        type: 'options',
        question: `是什么品种的${getAnimalName(answers.petType)}呢？`,
        subtitle: '选择最接近的品种，或选择"混种"、"不确定"',
        options: getBreedOptions(answers.petType),
        required: false
      },
      {
        id: 'color',
        type: 'options',
        question: `${answers.petName}是什么颜色的？`,
        options: [
          { value: 'black', label: '黑色' },
          { value: 'white', label: '白色' },
          { value: 'brown', label: '棕色' },
          { value: 'gray', label: '灰色' },
          { value: 'golden', label: '金色' },
          { value: 'yellow', label: '黄色' },
          { value: 'orange', label: '橙色' },
          { value: 'red', label: '红色' },
          { value: 'cream', label: '奶油色' },
          { value: 'tan', label: '棕褐色' },
          { value: 'silver', label: '银色' },
          { value: 'blue', label: '蓝色' },
          { value: 'chocolate', label: '巧克力色' },
          { value: 'caramel', label: '焦糖色' },
          { value: 'black-white', label: '黑白相间' },
          { value: 'brown-white', label: '棕白相间' },
          { value: 'gray-white', label: '灰白相间' },
          { value: 'tabby', label: '虎斑色' },
          { value: 'tricolor', label: '三色' },
          { value: 'multicolor', label: '多种颜色' }
        ],
        required: true
      },
      {
        id: 'gender',
        type: 'options',
        question: `${answers.petName}是男孩还是女孩？`,
        options: [
          { value: 'male', label: '男孩', icon: CircleDot },
          { value: 'female', label: '女孩', icon: Circle }
        ],
        required: true
      },
      {
        id: 'birthDate',
        type: 'date',
        question: `${answers.petName}什么时候出生？`,
        subtitle: '大概时间就可以',
        required: true
      },
      {
        id: 'passingDate',
        type: 'date',
        question: `它什么时候离开的？`,
        required: true
      },
      {
        id: 'photos',
        type: 'photos',
        question: `添加${answers.petName}的照片`,
        subtitle: '第一张照片将作为主图显示，最多可以上传10张照片',
        required: false
      },
      {
        id: 'contentChoice',
        type: 'options',
        question: `如何创建${answers.petName}的纪念内容？`,
        subtitle: '选择适合你的方式',
        options: [
          { 
            value: 'ai-generated', 
            label: 'AI智能生成（推荐）', 
            emoji: '🤖',
            description: '回答几个简单问题，AI为你生成温馨的纪念文案'
          },
          { 
            value: 'self-written', 
            label: '自己撰写', 
            emoji: '✍️',
            description: '完全由你来写纪念内容和回忆'
          }
        ],
        required: true
      }
    ]

    // 根据用户选择添加不同的问题
    if (answers.contentChoice === 'ai-generated') {
      baseQuestions.push(
        {
          id: 'personality',
          type: 'multiple',
          question: `${answers.petName}有什么性格特点？`,
          subtitle: '可以选择多个，这有助于AI生成更个性化的内容',
          options: getPersonalityOptions(answers.petType),
          required: false
        },
        {
          id: 'favoriteActivities',
          type: 'multiple',
          question: `${answers.petName}最喜欢做什么？`,
          subtitle: '选择它最爱的活动，帮助AI了解它的生活习惯',
          options: getFavoriteActivityOptions(answers.petType),
          required: false
        }
      )
    }

    // 添加回忆问题（两种选择都需要）
    baseQuestions.push({
      id: 'specialMemory',
      type: 'textarea',
      question: answers.contentChoice === 'ai-generated' 
        ? `分享一个关于${answers.petName}的特别回忆` 
        : `写下关于${answers.petName}的纪念内容`,
      subtitle: answers.contentChoice === 'ai-generated'
        ? '分享一个小故事或特别的时刻，AI会结合这些信息生成完整的纪念文案'
        : '可以是生平故事、美好回忆、性格特点等任何你想分享的内容',
      placeholder: answers.contentChoice === 'ai-generated'
        ? '例如：它最喜欢在阳台晒太阳，每次我回家都会摇尾巴迎接我...'
        : '写下你们之间最珍贵的回忆...',
      required: answers.contentChoice === 'self-written'
    })

    return baseQuestions
  }

  const questions = getQuestions()

  // 只有在用户未登录时才显示账户选择和名字问题
  if (!user) {
    questions.push({
      id: 'accountChoice',
      type: 'options',
      question: '如何保存这个纪念页面？',
      subtitle: '选择适合你的方式来管理纪念页面',
      options: [
        { 
          value: 'register', 
          label: '注册账号（推荐）', 
          emoji: '账号',
          description: '注册账号后可以编辑、管理多个纪念页面，享受完整功能'
        },
        { 
          value: 'guest', 
          label: '游客创建', 
          emoji: '助手',
          description: '只需要留下姓名，快速创建纪念页面'
        }
      ],
      required: true
    })

    // 根据账户选择决定是否需要姓名
    if (answers.accountChoice === 'guest') {
      questions.push({
        id: 'creatorName',
        type: 'text',
        question: '请告诉我你的名字',
        subtitle: '这样我就知道是谁创建了这个纪念页面',
        placeholder: '你的名字...',
        required: true
      })
    }
  }

  function getAnimalName(petType: string) {
    const typeMap: { [key: string]: string } = {
      'dog': '狗狗',
      'cat': '猫咪',
      'bird': '鸟儿',
      'rabbit': '兔子',
      'hamster': '仓鼠',
      'guinea-pig': '豚鼠',
      'other': '宠物'
    }
    return typeMap[petType] || '宠物'
  }

  function getBreedOptions(petType: string) {
    const baseOptions = [
      { value: 'mixed', label: '混种' },
      { value: 'unknown', label: '不确定' }
    ]

    switch (petType) {
      case 'dog':
        return [
          { value: 'labrador', label: '拉布拉多' },
          { value: 'golden-retriever', label: '金毛寻回犬' },
          { value: 'husky', label: '哈士奇' },
          { value: 'shiba', label: '柴犬' },
          { value: 'corgi', label: '柯基' },
          { value: 'poodle', label: '贵宾犬' },
          { value: 'beagle', label: '比格犬' },
          { value: 'chihuahua', label: '吉娃娃' },
          { value: 'bulldog', label: '斗牛犬' },
          { value: 'german-shepherd', label: '德国牧羊犬' },
          { value: 'border-collie', label: '边境牧羊犬' },
          { value: 'samoyed', label: '萨摩耶' },
          ...baseOptions
        ]
      case 'cat':
        return [
          { value: 'british-shorthair', label: '英国短毛猫' },
          { value: 'american-shorthair', label: '美国短毛猫' },
          { value: 'persian', label: '波斯猫' },
          { value: 'siamese', label: '暹罗猫' },
          { value: 'ragdoll', label: '布偶猫' },
          { value: 'maine-coon', label: '缅因猫' },
          { value: 'scottish-fold', label: '苏格兰折耳猫' },
          { value: 'russian-blue', label: '俄罗斯蓝猫' },
          { value: 'bengal', label: '孟加拉猫' },
          { value: 'abyssinian', label: '阿比西尼亚猫' },
          ...baseOptions
        ]
      case 'bird':
        return [
          { value: 'budgerigar', label: '虎皮鹦鹉' },
          { value: 'cockatiel', label: '玄凤鹦鹉' },
          { value: 'canary', label: '金丝雀' },
          { value: 'lovebird', label: '牡丹鹦鹉' },
          { value: 'finch', label: '文鸟' },
          { value: 'conure', label: '小型鹦鹉' },
          { value: 'macaw', label: '金刚鹦鹉' },
          { value: 'african-grey', label: '非洲灰鹦鹉' },
          ...baseOptions
        ]
      case 'rabbit':
        return [
          { value: 'holland-lop', label: '荷兰垂耳兔' },
          { value: 'netherland-dwarf', label: '荷兰侏儒兔' },
          { value: 'lionhead', label: '狮子头兔' },
          { value: 'angora', label: '安哥拉兔' },
          { value: 'mini-rex', label: '迷你雷克斯兔' },
          { value: 'flemish-giant', label: '佛兰德巨兔' },
          ...baseOptions
        ]
      case 'hamster':
        return [
          { value: 'golden', label: '金丝熊' },
          { value: 'dwarf', label: '侏儒仓鼠' },
          { value: 'chinese', label: '中国仓鼠' },
          { value: 'roborovski', label: '罗伯罗夫斯基仓鼠' },
          ...baseOptions
        ]
      case 'guinea-pig':
        return [
          { value: 'american', label: '美国豚鼠' },
          { value: 'peruvian', label: '秘鲁豚鼠' },
          { value: 'abyssinian', label: '阿比西尼亚豚鼠' },
          { value: 'skinny', label: '无毛豚鼠' },
          ...baseOptions
        ]
      default:
        return baseOptions
    }
  }

  function getPersonalityOptions(petType: string) {
    switch (petType) {
      case 'dog':
        return [
          { value: '忠诚可靠', label: '忠诚可靠', emoji: '❤️' },
          { value: '顽皮活泼', label: '顽皮活泼', emoji: '⚡' },
          { value: '温柔友善', label: '温柔友善', emoji: '🤗' },
          { value: '精力充沛', label: '精力充沛', emoji: '💪' },
          { value: '聪明机警', label: '聪明机警', emoji: '🧠' },
          { value: '保护意识强', label: '保护意识强', emoji: '🛡️' },
          { value: '社交能力强', label: '社交能力强', emoji: '👥' },
          { value: '温顺听话', label: '温顺听话', emoji: '😇' },
          { value: '勇敢无畏', label: '勇敢无畏', emoji: '🦁' },
          { value: '粘人撒娇', label: '粘人撒娇', emoji: '🥰' }
        ]
      case 'cat':
        return [
          { value: '独立自主', label: '独立自主', emoji: '👑' },
          { value: '优雅高贵', label: '优雅高贵', emoji: '✨' },
          { value: '温柔安静', label: '温柔安静', emoji: '🌙' },
          { value: '好奇心强', label: '好奇心强', emoji: '🔍' },
          { value: '慵懒惬意', label: '慵懒惬意', emoji: '😴' },
          { value: '机敏敏捷', label: '机敏敏捷', emoji: '⚡' },
          { value: '亲人粘腻', label: '亲人粘腻', emoji: '💕' },
          { value: '神秘莫测', label: '神秘莫测', emoji: '🔮' },
          { value: '爱撒娇', label: '爱撒娇', emoji: '🥰' },
          { value: '警觉谨慎', label: '警觉谨慎', emoji: '👁️' }
        ]
      case 'bird':
        return [
          { value: '活泼好动', label: '活泼好动', emoji: '⚡' },
          { value: '聪明学舌', label: '聪明学舌', emoji: '🧠' },
          { value: '社交活跃', label: '社交活跃', emoji: '👥' },
          { value: '好奇探索', label: '好奇探索', emoji: '🔍' },
          { value: '温顺亲人', label: '温顺亲人', emoji: '💕' },
          { value: '机警敏感', label: '机警敏感', emoji: '👁️' },
          { value: '爱表演', label: '爱表演', emoji: '🎭' },
          { value: '喜欢互动', label: '喜欢互动', emoji: '🤝' },
          { value: '情绪丰富', label: '情绪丰富', emoji: '🌈' },
          { value: '忠诚专一', label: '忠诚专一', emoji: '❤️' }
        ]
      case 'rabbit':
        return [
          { value: '温顺可爱', label: '温顺可爱', emoji: '🥰' },
          { value: '胆小谨慎', label: '胆小谨慎', emoji: '😊' },
          { value: '活泼跳跃', label: '活泼跳跃', emoji: '🦘' },
          { value: '好奇心强', label: '好奇心强', emoji: '🔍' },
          { value: '爱干净', label: '爱干净', emoji: '✨' },
          { value: '安静文雅', label: '安静文雅', emoji: '🌸' },
          { value: '聪明机灵', label: '聪明机灵', emoji: '🧠' },
          { value: '喜欢探索', label: '喜欢探索', emoji: '🗺️' },
          { value: '温和友善', label: '温和友善', emoji: '🤗' },
          { value: '敏感细腻', label: '敏感细腻', emoji: '💖' }
        ]
      case 'hamster':
        return [
          { value: '小巧可爱', label: '小巧可爱', emoji: '🐹' },
          { value: '好奇活泼', label: '好奇活泼', emoji: '🔍' },
          { value: '勤劳储藏', label: '勤劳储藏', emoji: '🥜' },
          { value: '夜行活跃', label: '夜行活跃', emoji: '🌙' },
          { value: '警觉机敏', label: '警觉机敏', emoji: '⚡' },
          { value: '爱运动', label: '爱运动', emoji: '💪' },
          { value: '独立自主', label: '独立自主', emoji: '👑' },
          { value: '温顺乖巧', label: '温顺乖巧', emoji: '😇' },
          { value: '爱探索', label: '爱探索', emoji: '🗺️' },
          { value: '萌萌哒', label: '萌萌哒', emoji: '🥰' }
        ]
      case 'guinea-pig':
        return [
          { value: '温顺友善', label: '温顺友善', emoji: '🤗' },
          { value: '社交活跃', label: '社交活跃', emoji: '👥' },
          { value: '好奇心强', label: '好奇心强', emoji: '🔍' },
          { value: '爱交流', label: '爱交流', emoji: '💬' },
          { value: '群居合作', label: '群居合作', emoji: '🤝' },
          { value: '温和安静', label: '温和安静', emoji: '🌸' },
          { value: '聪明可训', label: '聪明可训', emoji: '🧠' },
          { value: '活泼可爱', label: '活泼可爱', emoji: '⚡' },
          { value: '喜欢互动', label: '喜欢互动', emoji: '💕' },
          { value: '敏感细心', label: '敏感细心', emoji: '💖' }
        ]
      default:
        return [
          { value: '温顺可爱', label: '温顺可爱', emoji: '🥰' },
          { value: '活泼好动', label: '活泼好动', emoji: '⚡' },
          { value: '聪明机灵', label: '聪明机灵', emoji: '🧠' },
          { value: '温和友善', label: '温和友善', emoji: '🤗' },
          { value: '好奇心强', label: '好奇心强', emoji: '🔍' },
          { value: '忠诚可靠', label: '忠诚可靠', emoji: '❤️' }
        ]
    }
  }

  function getFavoriteActivityOptions(petType: string) {
    switch (petType) {
      case 'dog':
        return [
          { value: '散步遛弯', label: '散步遛弯', emoji: '🚶' },
          { value: '捡球游戏', label: '捡球游戏', emoji: '🎾' },
          { value: '游泳戏水', label: '游泳戏水', emoji: '🏊' },
          { value: '奔跑撒欢', label: '奔跑撒欢', emoji: '🏃' },
          { value: '晒太阳睡觉', label: '晒太阳睡觉', emoji: '☀️' },
          { value: '吃美味零食', label: '吃美味零食', emoji: '🍖' },
          { value: '撕咬玩具', label: '撕咬玩具', emoji: '🧸' },
          { value: '迎接主人回家', label: '迎接主人回家', emoji: '🏠' },
          { value: '坐车兜风', label: '坐车兜风', emoji: '🚗' },
          { value: '挖土刨坑', label: '挖土刨坑', emoji: '⛏️' },
          { value: '看门守家', label: '看门守家', emoji: '🛡️' },
          { value: '和其他狗玩耍', label: '和其他狗玩耍', emoji: '🐕' }
        ]
      case 'cat':
        return [
          { value: '晒太阳小憩', label: '晒太阳小憩', emoji: '☀️' },
          { value: '长时间睡觉', label: '长时间睡觉', emoji: '💤' },
          { value: '玩毛线球', label: '玩毛线球', emoji: '🧶' },
          { value: '捕猎小玩具', label: '捕猎小玩具', emoji: '🐭' },
          { value: '攀爬高处', label: '攀爬高处', emoji: '🧗' },
          { value: '磨爪子', label: '磨爪子', emoji: '✨' },
          { value: '趴窗台看鸟', label: '趴窗台看鸟', emoji: '🪟' },
          { value: '发出呼噜声', label: '发出呼噜声', emoji: '😸' },
          { value: '钻纸箱', label: '钻纸箱', emoji: '📦' },
          { value: '舔毛理毛', label: '舔毛理毛', emoji: '🧼' },
          { value: '蹭主人撒娇', label: '蹭主人撒娇', emoji: '💕' },
          { value: '追逐光点', label: '追逐光点', emoji: '✨' }
        ]
      case 'bird':
        return [
          { value: '唱歌鸣叫', label: '唱歌鸣叫', emoji: '🎵' },
          { value: '在笼中飞翔', label: '在笼中飞翔', emoji: '🕊️' },
          { value: '对镜子说话', label: '对镜子说话', emoji: '🪞' },
          { value: '啄食种子', label: '啄食种子', emoji: '🌱' },
          { value: '水中洗澡', label: '水中洗澡', emoji: '🛁' },
          { value: '攀爬杠架', label: '攀爬杠架', emoji: '🪜' },
          { value: '模仿人说话', label: '模仿人说话', emoji: '💬' },
          { value: '玩小玩具', label: '玩小玩具', emoji: '🧸' },
          { value: '整理羽毛', label: '整理羽毛', emoji: '🪶' },
          { value: '与主人互动', label: '与主人互动', emoji: '👥' },
          { value: '站在肩膀上', label: '站在肩膀上', emoji: '🦜' },
          { value: '啄食果蔬', label: '啄食果蔬', emoji: '🍎' }
        ]
      case 'rabbit':
        return [
          { value: '蹦蹦跳跳', label: '蹦蹦跳跳', emoji: '🦘' },
          { value: '吃干草', label: '吃干草', emoji: '🌾' },
          { value: '挖洞做窝', label: '挖洞做窝', emoji: '🕳️' },
          { value: '啃咬玩具', label: '啃咬玩具', emoji: '🧸' },
          { value: '躲在角落', label: '躲在角落', emoji: '🏠' },
          { value: '舔毛清洁', label: '舔毛清洁', emoji: '🧼' },
          { value: '好奇探索', label: '好奇探索', emoji: '🔍' },
          { value: '蜷缩睡觉', label: '蜷缩睡觉', emoji: '💤' },
          { value: '快速奔跑', label: '快速奔跑', emoji: '💨' },
          { value: '吃胡萝卜', label: '吃胡萝卜', emoji: '🥕' },
          { value: '磨牙咀嚼', label: '磨牙咀嚼', emoji: '🦷' },
          { value: '竖耳警觉', label: '竖耳警觉', emoji: '👂' }
        ]
      case 'hamster':
        return [
          { value: '跑转轮', label: '跑转轮', emoji: '⭕' },
          { value: '在颊囊囤食', label: '在颊囊囤食', emoji: '🥜' },
          { value: '窝里酣睡', label: '窝里酣睡', emoji: '💤' },
          { value: '爬管道隧道', label: '爬管道隧道', emoji: '🔄' },
          { value: '刨挖垫料', label: '刨挖垫料', emoji: '🏠' },
          { value: '啃食瓜子', label: '啃食瓜子', emoji: '🌰' },
          { value: '四处探索', label: '四处探索', emoji: '🔍' },
          { value: '玩滚球', label: '玩滚球', emoji: '⚪' },
          { value: '用小爪洗脸', label: '用小爪洗脸', emoji: '🧼' },
          { value: '钻进小屋', label: '钻进小屋', emoji: '🏘️' },
          { value: '站立观察', label: '站立观察', emoji: '👁️' },
          { value: '啃磨牙棒', label: '啃磨牙棒', emoji: '🦷' }
        ]
      case 'guinea-pig':
        return [
          { value: '吃新鲜蔬菜', label: '吃新鲜蔬菜', emoji: '🥬' },
          { value: '在笼中跑圈', label: '在笼中跑圈', emoji: '🔄' },
          { value: '钻小隧道', label: '钻小隧道', emoji: '🏠' },
          { value: '和同伴聊天', label: '和同伴聊天', emoji: '👥' },
          { value: '咕咕叫', label: '咕咕叫', emoji: '💬' },
          { value: '抱团睡觉', label: '抱团睡觉', emoji: '💤' },
          { value: '好奇探索', label: '好奇探索', emoji: '🔍' },
          { value: '啃食干草', label: '啃食干草', emoji: '🌾' },
          { value: '追逐游戏', label: '追逐游戏', emoji: '🎮' },
          { value: '互相舔毛', label: '互相舔毛', emoji: '🧼' },
          { value: '竖立耳朵听声', label: '竖立耳朵听声', emoji: '👂' },
          { value: '抢食物', label: '抢食物', emoji: '🍽️' }
        ]
      default:
        return [
          { value: '自由玩耍', label: '自由玩耍', emoji: '🎮' },
          { value: '安静休息', label: '安静休息', emoji: '💤' },
          { value: '享用美食', label: '享用美食', emoji: '🍽️' },
          { value: '好奇探索', label: '好奇探索', emoji: '🔍' },
          { value: '晒太阳', label: '晒太阳', emoji: '☀️' },
          { value: '与主人互动', label: '与主人互动', emoji: '👥' }
        ]
    }
  }

  function nextQuestion() {
    if (isTransitioning) return
    
    const question = questions[currentQuestion]
    const currentValue = answers[question.id as keyof FormData]
    
    // 验证必填项
    if (question.required) {
      if (question.type === 'multiple') {
        if (!Array.isArray(currentValue) || currentValue.length === 0) {
          alert('请至少选择一个选项')
          return
        }
      } else if (!currentValue || (typeof currentValue === 'string' && !currentValue.trim())) {
        alert('请填写必填信息')
        return
      }
    }
    
    transitionToNext()
  }

  function previousQuestion() {
    if (isTransitioning || currentQuestion === 0) return
    
    setIsTransitioning(true)
    setShowContinueButton(false)
    
    setTimeout(() => {
      setCurrentQuestion(prev => prev - 1)
      setShowContinueButton(true)
      setIsTransitioning(false)
    }, 300) // 更快的转场效果用于返回
  }

  function selectOption(value: string, fieldId: string) {
    if (isTransitioning) return
    
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
    
    // 延迟自动进入下一题
    setTimeout(() => {
      transitionToNext()
    }, 800)
  }

  function toggleMultiple(value: string, fieldId: string) {
    setAnswers(prev => {
      const currentValues = (prev[fieldId as keyof FormData] as string[]) || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      return { ...prev, [fieldId]: newValues }
    })
    
    setShowContinueButton(true)
  }

  function skipQuestion() {
    if (isTransitioning) return
    transitionToNext()
  }

  function transitionToNext() {
    if (isTransitioning) return
    setIsTransitioning(true)
    setShowContinueButton(false)
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setShowContinueButton(true)
      } else {
        // 完成表单
        completeForm()
      }
      setIsTransitioning(false)
    }, 600)
  }

  async function completeForm() {
    if (!user) {
      // 未登录用户处理
      if (answers.accountChoice === 'register') {
        // 用户选择注册，保存表单数据并跳转到注册页
        sessionStorage.setItem('memorialFormData', JSON.stringify(answers))
        sessionStorage.setItem('memorialFormType', 'pet')
        router.push('/register')
        return
      } else if (answers.accountChoice === 'guest') {
        // 用户选择游客模式，直接创建纪念页
        if (!answers.creatorName.trim()) {
          alert('请填写你的名字')
          return
        }
        await createGuestMemorial()
        return
      }
      // 如果没有选择，不应该到达这里（表单验证应该已经处理）
      return
    }

    // 已登录用户直接创建
    await createUserMemorial()
  }

  async function createUserMemorial() {
    setIsSubmitting(true)
    setCurrentQuestion(questions.length) // 显示完成页面

    try {
      // 先上传图片文件
      const imageData = await uploadImages()
      
      // 准备API数据
      const memorialData = {
        type: 'PET',
        subjectName: answers.petName,
        birthDate: answers.birthDate,
        deathDate: answers.passingDate,
        story: answers.specialMemory,
        authorId: user!.id,
        creatorName: user!.name,
        creatorEmail: user!.email || '',
        subjectType: answers.petType,
        breed: answers.breed || '',
        color: answers.color,
        gender: answers.gender,
        personalityTraits: answers.personality || [],
        favoriteActivities: answers.favoriteActivities || [],
        contentChoice: answers.contentChoice,
        imageData: imageData
      }

      console.log('提交的纪念页数据:', memorialData)

      const result = await submitMemorial(memorialData)
      
      setIsSubmitting(false)
      
      // 跳转到新创建的纪念页面详情
      setTimeout(() => {
        router.push(`/community-pet-obituaries/${result.memorial.slug}`)
      }, 3000)

    } catch (error: any) {
      console.error('Create memorial error:', error)
      alert(`创建纪念页失败: ${error.message}，请重试`)
      setIsSubmitting(false)
      setCurrentQuestion(questions.length - 1) // 回到最后一个问题
    }
  }

  async function createGuestMemorial() {
    setIsSubmitting(true)
    setCurrentQuestion(questions.length) // 显示完成页面

    try {
      // 先上传图片文件
      const imageData = await uploadImages()
      
      // 为游客创建临时用户ID
      const tempUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 准备API数据
      const memorialData = {
        type: 'PET',
        subjectName: answers.petName,
        birthDate: answers.birthDate,
        deathDate: answers.passingDate,
        story: answers.specialMemory,
        authorId: tempUserId, // 使用临时用户ID
        creatorName: answers.creatorName,
        creatorEmail: '',
        subjectType: answers.petType,
        breed: answers.breed || '',
        color: answers.color,
        gender: answers.gender,
        personalityTraits: answers.personality || [],
        favoriteActivities: answers.favoriteActivities || [],
        contentChoice: answers.contentChoice,
        isGuestCreated: true, // 标记为游客创建
        imageData: imageData
      }

      console.log('提交的游客纪念页数据:', memorialData)

      const result = await submitMemorial(memorialData)
      
      setIsSubmitting(false)
      
      // 跳转到新创建的纪念页面详情
      setTimeout(() => {
        router.push(`/community-pet-obituaries/${result.memorial.slug}`)
      }, 3000)

    } catch (error: any) {
      console.error('Create guest memorial error:', error)
      alert(`创建纪念页失败: ${error.message}，请重试`)
      setIsSubmitting(false)
      setCurrentQuestion(questions.length - 1) // 回到最后一个问题
    }
  }

  async function uploadImages(): Promise<any[]> {
    const imageData: any[] = []
    
    try {
      // 上传所有照片文件，第一张设为主图
      for (let i = 0; i < answers.photos.length; i++) {
        const photo = answers.photos[i]
        const isMain = i === 0 // 第一张照片设为主图
        const fileInfo = await uploadSingleImage(photo, isMain)
        imageData.push(fileInfo)
      }
      
      return imageData
    } catch (error) {
      console.error('图片上传失败:', error)
      throw new Error('图片上传失败，请重试')
    }
  }
  
  async function uploadSingleImage(file: File, isMain: boolean): Promise<any> {
    // 只上传文件到服务器，不创建数据库记录
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadResponse = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('文件上传失败:', errorText)
      throw new Error(`文件上传失败: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    
    // 返回图片信息，稍后会在创建memorial时一起创建数据库记录
    return {
      filename: uploadResult.filename,
      originalName: file.name,
      url: uploadResult.url || `/uploads/images/${uploadResult.filename}`,
      size: file.size,
      mimeType: file.type,
      isMain: isMain
    }
  }

  async function submitMemorial(memorialData: any) {
    // 调用创建纪念页API
    const response = await fetch('/api/memorials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memorialData)
    })

    const result = await response.json()
    console.log('API响应:', result)

    if (response.ok) {
      return result
    } else {
      console.error('API错误响应:', result)
      console.error('响应状态:', response.status)
      
      let errorMessage = '创建纪念页失败'
      if (result.error) {
        errorMessage = result.error
        if (result.details) {
          console.error('错误详情:', result.details)
          errorMessage += ` (详情: ${result.details})`
        }
      }
      
      throw new Error(errorMessage)
    }
  }

  function handleInputChange(value: string, fieldId: string) {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
    setShowContinueButton(true)
  }

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    
    // 检查总数量限制
    const currentCount = answers.photos.length
    const newCount = currentCount + files.length
    if (newCount > 10) {
      alert(`最多只能上传10张照片，当前已有${currentCount}张`)
      return
    }
    
    // 验证每个文件
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`照片 ${file.name} 大小不能超过5MB`)
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是有效的图片文件`)
        return
      }
    }
    
    setAnswers(prev => ({ 
      ...prev, 
      photos: [...prev.photos, ...files] 
    }))
    setShowContinueButton(true)
    
    // 清空input的值，允许重复选择相同文件
    event.target.value = ''
  }

  function removePhoto(index: number) {
    setAnswers(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  function movePhotoToFirst(index: number) {
    if (index === 0) return // 已经是第一张
    
    setAnswers(prev => {
      const photos = [...prev.photos]
      const [photo] = photos.splice(index, 1)
      photos.unshift(photo)
      return { ...prev, photos }
    })
  }

  // 拖拽处理函数
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      setAnswers(prev => {
        const photos = [...prev.photos]
        const draggedPhoto = photos[draggedIndex]
        photos.splice(draggedIndex, 1)
        photos.splice(dragOverIndex, 0, draggedPhoto)
        return { ...prev, photos }
      })
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  // 表单页面滑动手势处理
  const handleFormTouchStart = (e: React.TouchEvent) => {
    // 只有在表单主容器上才处理滑动手势，避免与照片拖拽冲突
    if (!e.currentTarget.classList.contains('form-swipe-container')) return
    
    const touch = e.touches[0]
    setSwipeStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    })
  }

  const handleFormTouchMove = (e: React.TouchEvent) => {
    if (!swipeStart || !e.currentTarget.classList.contains('form-swipe-container')) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - swipeStart.x
    const deltaY = touch.clientY - swipeStart.y
    
    // 如果垂直滑动距离大于水平，则认为是滚动行为，不处理
    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    
    // 如果水平滑动距离足够大，则阻止默认滚动行为
    if (Math.abs(deltaX) > 50) {
      e.preventDefault()
    }
  }

  const handleFormTouchEnd = (e: React.TouchEvent) => {
    if (!swipeStart || !e.currentTarget.classList.contains('form-swipe-container')) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - swipeStart.x
    const deltaY = touch.clientY - swipeStart.y
    const deltaTime = Date.now() - swipeStart.time
    
    // 重置滑动状态
    setSwipeStart(null)
    
    // 滑动手势检测条件：
    // 1. 水平滑动距离大于50px
    // 2. 垂直滑动距离小于100px（避免与滚动冲突）
    // 3. 滑动时间小于500ms（快速滑动）
    // 4. 不在转换状态中
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 500 && !isTransitioning) {
      if (deltaX > 0 && currentQuestion > 0) {
        // 向右滑动，返回上一题
        previousQuestion()
      } else if (deltaX < 0 && currentQuestion < questions.length - 1) {
        // 向左滑动，进入下一题（需要验证当前题目）
        const question = questions[currentQuestion]
        if (!question) return
        
        // 检查当前问题是否可以继续
        let canProceed = true
        
        if (question.required) {
          const currentValue = answers[question.id as keyof FormData]
          if (!currentValue || 
              (typeof currentValue === 'string' && !currentValue.trim()) ||
              (Array.isArray(currentValue) && currentValue.length === 0)) {
            canProceed = false
          }
        }
        
        if (canProceed) {
          nextQuestion()
        }
      }
    }
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      index: index
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStart.x)
    const deltaY = Math.abs(touch.clientY - touchStart.y)
    
    // 如果移动距离超过阈值，开始拖拽
    if (deltaX > 20 || deltaY > 20) {
      setDraggedIndex(touchStart.index)
      e.preventDefault() // 防止页面滚动
    }
    
    // 找到当前触摸位置下的元素
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const photoElement = elementBelow?.closest('[data-photo-index]')
    if (photoElement) {
      const index = parseInt(photoElement.getAttribute('data-photo-index') || '0')
      setDragOverIndex(index)
    }
  }

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      setAnswers(prev => {
        const photos = [...prev.photos]
        const draggedPhoto = photos[draggedIndex]
        photos.splice(draggedIndex, 1)
        photos.splice(dragOverIndex, 0, draggedPhoto)
        return { ...prev, photos }
      })
    }
    setTouchStart(null)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  async function generateAIContent() {
    if (isGenerating) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-obituary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petName: answers.petName,
          petType: answers.petType,
          breed: answers.breed,
          color: answers.color,
          gender: answers.gender,
          birthDate: answers.birthDate,
          deathDate: answers.passingDate,
          personalityTraits: answers.personality,
          favoriteActivities: answers.favoriteActivities,
          specialMemory: answers.specialMemory
        })
      })

      if (!response.ok) {
        throw new Error('AI生成失败')
      }

      const result = await response.json()
      console.log('AI生成结果:', result)

      if (result.success && result.content) {
        // 将AI生成的内容填入文本框
        setAnswers(prev => ({ ...prev, specialMemory: result.content }))
      } else {
        throw new Error('AI生成返回了空内容')
      }

    } catch (error) {
      console.error('AI生成错误:', error)
      alert('AI生成失败，请重试或手动填写')
    } finally {
      setIsGenerating(false)
    }
  }

  // 键盘事件
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Enter键：进入下一题
      if (e.key === 'Enter' && !e.shiftKey && showContinueButton && !isTransitioning) {
        // 检查当前问题是否需要验证
        const question = questions[currentQuestion]
        if (!question) return
        
        // 对于文本输入和日期输入，检查是否有值
        if (question.type === 'text' || question.type === 'date') {
          const currentValue = answers[question.id as keyof FormData]
          if (question.required && (!currentValue || (typeof currentValue === 'string' && !currentValue.trim()))) {
            return // 不进入下一题，让用户填写
          }
        }
        
        // 对于textarea，检查是否在文本框内
        if (question.type === 'textarea' && (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
          return // 在textarea内时回车应该换行，不进入下一题
        }
        
        e.preventDefault()
        nextQuestion()
      }
      
      // Escape键或Backspace键：返回上一题
      if ((e.key === 'Escape' || e.key === 'Backspace') && !isTransitioning && currentQuestion > 0) {
        // 如果用户正在输入框中，且按的是Backspace，不触发返回
        const activeElement = document.activeElement
        if (e.key === 'Backspace' && 
            activeElement && 
            (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
            (activeElement as HTMLInputElement).value.length > 0) {
          return
        }
        
        e.preventDefault()
        previousQuestion()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showContinueButton, currentQuestion, answers, isTransitioning])

  // 显示继续按钮
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinueButton(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [currentQuestion])

  const currentQuestionData = questions[currentQuestion]

  // 渲染导航按钮组
  const renderNavigationButtons = () => (
    <div className="flex gap-3 sm:gap-4 mt-8 sm:mt-10 items-center justify-center">
      {currentQuestion > 0 && (
        <button
          className={`bg-transparent text-gray-600 border border-gray-300 py-3 sm:py-3 px-5 sm:px-6 text-sm sm:text-base cursor-pointer transition-all duration-300 hover:bg-gray-50 touch-manipulation min-h-[44px] ${
            showContinueButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
          onClick={previousQuestion}
        >
          ← 返回
        </button>
      )}
      <button
        className={`bg-black text-white border-none py-3 sm:py-3 px-6 sm:px-8 text-sm sm:text-base cursor-pointer transition-all duration-300 hover:bg-gray-800 touch-manipulation min-h-[44px] ${
          showContinueButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        onClick={nextQuestion}
      >
        继续
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white z-50" style={{ overflow: 'hidden' }}>
      {/* 返回按钮 */}
      {currentQuestion > 0 && !isTransitioning && (
        <button
          onClick={previousQuestion}
          className="fixed top-4 left-4 sm:top-5 sm:left-5 w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-300 hover:shadow-lg z-50 group touch-manipulation"
          title="返回上一步 (ESC)"
        >
          <svg 
            className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 进度指示器 */}
      <div className="fixed top-4 sm:top-5 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-50">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-all duration-400 ${
              i <= (currentQuestion / questions.length) * 10 ? 'bg-black' : 'bg-black/20'
            }`}
          />
        ))}
      </div>
      
      {/* 键盘提示和品牌标识 */}
      <div className="fixed bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-gray-300 mb-2 font-light">
          <span className="sm:hidden">
            {currentQuestion > 0 && '← 滑动返回'} {currentQuestion < questions.length - 1 && '滑动继续 →'}
          </span>
          <span className="hidden sm:block">
            {currentQuestion > 0 && '← ESC 返回'} {currentQuestion < questions.length - 1 && '回车 继续 →'}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-400 font-light">
          永念
        </div>
      </div>

      {/* 当前问题 */}
      {currentQuestion < questions.length && (
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 transition-all duration-600 ease-out form-swipe-container ${
            isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
          onTouchStart={handleFormTouchStart}
          onTouchMove={handleFormTouchMove}
          onTouchEnd={handleFormTouchEnd}
        >
          <h1 className="text-xl sm:text-2xl md:text-4xl font-light text-gray-900 text-center mb-6 sm:mb-8 md:mb-12 leading-tight max-w-4xl">
            {currentQuestionData.question}
          </h1>
          
          {currentQuestionData.subtitle && (
            <div className="text-sm sm:text-base text-gray-500 text-center mb-6 sm:mb-8 font-light">
              {currentQuestionData.subtitle}
            </div>
          )}

          {/* 文本输入 */}
          {currentQuestionData.type === 'text' && (
            <>
              <input
                type="text"
                placeholder={currentQuestionData.placeholder}
                className="border-0 border-b-2 border-gray-200 bg-transparent outline-none text-lg sm:text-xl md:text-2xl py-3 sm:py-4 text-center w-full max-w-lg transition-all duration-300 focus:border-black touch-manipulation"
                value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
                autoComplete="off"
                autoFocus
              />
              {renderNavigationButtons()}
            </>
          )}

          {/* 日期输入 */}
          {currentQuestionData.type === 'date' && (
            <>
              <input
                type="date"
                className="border-0 border-b-2 border-gray-200 bg-transparent outline-none text-lg sm:text-xl md:text-2xl py-3 sm:py-4 text-center w-full max-w-lg transition-all duration-300 focus:border-black touch-manipulation"
                value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
              />
              {renderNavigationButtons()}
            </>
          )}

          {/* 选项按钮 */}
          {currentQuestionData.type === 'options' && (
            <div className={`grid gap-3 sm:gap-4 max-w-2xl w-full ${
              currentQuestionData.options!.length <= 2 ? 'grid-cols-1' : 
              currentQuestionData.options!.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {currentQuestionData.options!.map((option) => (
                <button
                  key={option.value}
                  className={`border border-gray-200 bg-white p-4 sm:p-5 text-center cursor-pointer transition-all duration-300 text-base sm:text-lg hover:border-gray-400 hover:bg-gray-50 touch-manipulation min-h-[60px] sm:min-h-[auto] ${
                    'description' in option ? 'text-left' : ''
                  }`}
                  onClick={() => selectOption(option.value, currentQuestionData.id)}
                >
                  {('icon' in option && (option as any).icon) ? (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-600">
                      {React.createElement((option as any).icon, { className: "w-full h-full" })}
                    </div>
                  ) : ('emoji' in option && option.emoji && (
                    <div className="text-xl sm:text-2xl mb-2 text-center">{option.emoji}</div>
                  ))}
                  <div className={`text-sm sm:text-base ${'description' in option ? 'font-medium mb-1 sm:mb-2' : ''}`}>
                    {option.label}
                  </div>
                  {'description' in option && (
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      {(option as any).description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 多选按钮 */}
          {currentQuestionData.type === 'multiple' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-2xl w-full">
                {currentQuestionData.options!.map((option) => {
                  const isSelected = (answers[currentQuestionData.id as keyof FormData] as string[] || []).includes(option.value)
                  return (
                    <button
                      key={option.value}
                      className={`border p-4 sm:p-5 text-center cursor-pointer transition-all duration-300 text-base sm:text-lg touch-manipulation min-h-[60px] ${
                        isSelected 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleMultiple(option.value, currentQuestionData.id)}
                    >
                      {('icon' in option && (option as any).icon) ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-gray-600">
                          {React.createElement((option as any).icon, { className: "w-full h-full" })}
                        </div>
                      ) : ('emoji' in option && option.emoji && (
                        <div className="text-lg sm:text-xl mb-1">{option.emoji}</div>
                      ))}
                      <div className="text-sm sm:text-base">{option.label}</div>
                    </button>
                  )
                })}
              </div>
              {renderNavigationButtons()}
            </>
          )}

          {/* 文本域 */}
          {currentQuestionData.type === 'textarea' && (
            <>
              <div className="w-full max-w-2xl">
                <textarea
                  placeholder={currentQuestionData.placeholder}
                  className="border border-gray-200 bg-white outline-none text-base sm:text-lg p-4 sm:p-6 w-full min-h-32 resize-y transition-all duration-300 focus:border-black focus:shadow-sm touch-manipulation"
                  value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                  onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
                  rows={4}
                  autoFocus
                />
                
                {/* AI生成按钮 - 仅在AI生成模式下显示 */}
                {answers.contentChoice === 'ai-generated' && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg transition-all duration-300 hover:bg-blue-600 text-sm sm:text-base touch-manipulation min-h-[44px] ${
                        isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>AI生成中...</span>
                        </>
                      ) : (
                        <>
                          <div className="text-lg">🤖</div>
                          <span>AI智能生成纪念文案</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-4 mt-6">
                {renderNavigationButtons()}
                {!currentQuestionData.required && (
                  <button
                    className="bg-transparent text-gray-500 border-none text-sm cursor-pointer transition-all duration-300 hover:text-gray-700"
                    onClick={skipQuestion}
                  >
                    跳过
                  </button>
                )}
              </div>
            </>
          )}


          {/* 统一照片上传 */}
          {currentQuestionData.type === 'photos' && (
            <>
              <div className="max-w-2xl w-full">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="photosInput"
                  onChange={handlePhotosChange}
                />
                
                {/* 上传区域 */}
                <label
                  htmlFor="photosInput"
                  className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 mb-6 touch-manipulation min-h-[120px] sm:min-h-[auto]"
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📷</div>
                  <div className="text-base sm:text-lg text-gray-600 mb-2">点击选择照片</div>
                  <div className="text-xs sm:text-sm text-gray-500">第一张将作为主图，最多10张<br className="sm:hidden" /><span className="sm:inline"> · </span>支持 JPG、PNG、GIF 格式<br className="sm:hidden" /><span className="sm:inline"> · </span>可拖拽重新排序</div>
                </label>

                {/* 照片预览网格 */}
                {answers.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {answers.photos.map((photo, index) => (
                      <div 
                        key={index} 
                        className={`relative group cursor-move transition-all duration-200 ${
                          draggedIndex === index ? 'opacity-50 transform scale-105 z-10' : ''
                        } ${
                          dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                        }`}
                        data-photo-index={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragLeave={handleDragLeave}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`照片 ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg pointer-events-none"
                        />
                        {/* 拖拽指示器 */}
                        <div className="absolute top-1 right-1 text-white text-opacity-70 text-sm">
                          ⋮⋮
                        </div>
                        {/* 主图标识 */}
                        {index === 0 && (
                          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            主图
                          </div>
                        )}
                        {/* 设为主图按钮 */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => movePhotoToFirst(index)}
                            className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-1 sm:py-1 rounded hover:bg-blue-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation min-w-[44px] min-h-[32px] sm:min-h-[auto]"
                          >
                            设为主图
                          </button>
                        )}
                        {/* 删除按钮 */}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-500 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation min-w-[32px] min-h-[32px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {renderNavigationButtons()}
            </>
          )}

          {!currentQuestionData.required && currentQuestionData.type !== 'textarea' && currentQuestionData.type !== 'multiple' && currentQuestionData.type !== 'photo' && currentQuestionData.type !== 'photos' && (
            <button
              className="mt-3 sm:mt-4 bg-transparent text-gray-500 border-none text-sm cursor-pointer transition-all duration-300 hover:text-gray-700 touch-manipulation min-h-[44px]"
              onClick={skipQuestion}
            >
              跳过
            </button>
          )}
        </div>
      )}

      {/* 完成页面 */}
      {currentQuestion >= questions.length && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-light text-gray-900 mb-8">
              {isSubmitting ? '正在创建纪念页面...' : '纪念页面创建完成'}
            </h1>
            <div className="text-base text-gray-500 font-light">
              {isSubmitting ? '请稍候' : '感谢你分享这些珍贵的回忆'}
            </div>
            {!isSubmitting && (
              <div className="mt-8">
                <div className="text-sm text-gray-400">即将跳转到纪念页面...</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}