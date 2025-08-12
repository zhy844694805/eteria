"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { 
  Users, Heart, Baby, UserPlus, Users2, Handshake, Briefcase, User,
  Bot, Edit3, HeartHandshake, Dumbbell, Smile, Brain, Sun, 
  Wheat, Sparkles, Target, Star, GraduationCap, HandHeart, 
  Building, Trophy, Palette, BookOpen, Music, Camera,
  Scissors, PartyPopper, Flower, Plane, Drama, ChefHat
} from 'lucide-react'

interface ImmersiveFormProps {
  initialData?: any
}

interface FormData {
  personName: string
  relationship: string
  age: string
  occupation: string
  location: string
  birthDate: string
  passingDate: string
  photos: File[]
  writingMethod: string
  personalityTraits: string[]
  achievements: string[]
  hobbies: string[]
  specialMemory: string
  aiGeneratedObituary: string
  creatorName: string
  creatorEmail: string
  creatorRelationship: string
}

export function ImmersiveForm({ initialData }: ImmersiveFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [answers, setAnswers] = useState<FormData>({
    personName: "",
    relationship: "",
    age: "",
    occupation: "",
    location: "",
    birthDate: "",
    passingDate: "",
    photos: [],
    writingMethod: "",
    personalityTraits: [],
    achievements: [],
    hobbies: [],
    specialMemory: "",
    aiGeneratedObituary: "",
    creatorName: user?.name || "",
    creatorEmail: user?.email || "",
    creatorRelationship: ""
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
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
        id: 'personName',
        type: 'text',
        question: '请告诉我们，TA的姓名是什么？',
        placeholder: '输入姓名...',
        required: true
      },
      {
        id: 'relationship',
        type: 'options',
        question: `${answers.personName}与您是什么关系？`,
        subtitle: '这有助于我们理解您的情感',
        options: [
          { value: 'parent', label: '父母', icon: Users },
          { value: 'spouse', label: '配偶', icon: Heart },
          { value: 'child', label: '子女', icon: Baby },
          { value: 'sibling', label: '兄弟姐妹', icon: UserPlus },
          { value: 'relative', label: '亲戚', icon: Users2 },
          { value: 'friend', label: '朋友', icon: Handshake },
          { value: 'colleague', label: '同事', icon: Briefcase },
          { value: 'other', label: '其他', icon: User }
        ],
        required: true
      },
      {
        id: 'occupation',
        type: 'text',
        question: `${answers.personName}的职业是什么？`,
        subtitle: '帮助我们了解TA的社会角色',
        placeholder: '如：教师、医生、工程师...',
        required: false
      },
      {
        id: 'location',
        type: 'text',
        question: `${answers.personName}的祖籍是哪里？`,
        subtitle: '祖祖辈辈生活的地方',
        placeholder: '如：山东济南、江苏南京、广东广州...',
        required: false
      },
      {
        id: 'birthDate',
        type: 'date',
        question: `${answers.personName}的出生日期是？`,
        required: true
      },
      {
        id: 'passingDate',
        type: 'date',
        question: `${answers.personName}的去世日期是？`,
        required: true
      },
      {
        id: 'photos',
        type: 'photos',
        question: `请分享一些${answers.personName}的照片`,
        subtitle: '第一张照片将作为主照片显示，让更多人记住TA',
        required: true
      },
      {
        id: 'writingMethod',
        type: 'options',
        question: '您希望如何创建纪念文案？',
        subtitle: 'AI可以根据您提供的信息生成温馨的纪念文案',
        options: [
          { 
            value: 'ai-generated', 
            label: 'AI智能生成', 
            icon: Bot,
            description: '根据您提供的信息，AI将为您创作温馨感人的纪念文案'
          },
          { 
            value: 'self-written', 
            label: '自己编写', 
            icon: Edit3,
            description: '您可以亲自撰写纪念文案，表达最真挚的情感'
          }
        ],
        required: true
      }
    ]

    // 如果选择了AI生成，添加AI相关问题
    if (answers.writingMethod === 'ai-generated') {
      baseQuestions.push(
        {
          id: 'personalityTraits',
          type: 'multiple',
          question: `请描述${answers.personName}的性格特点`,
          subtitle: '选择最符合的性格特征，可多选',
          options: [
            { value: '慈祥温和', label: '慈祥温和', icon: HeartHandshake },
            { value: '坚韧不拔', label: '坚韧不拔', icon: Dumbbell },
            { value: '幽默风趣', label: '幽默风趣', icon: Smile },
            { value: '温柔体贴', label: '温柔体贴', icon: Heart },
            { value: '睿智博学', label: '睿智博学', icon: Brain },
            { value: '乐观向上', label: '乐观向上', icon: Sun },
            { value: '勤劳朴实', label: '勤劳朴实', icon: Wheat },
            { value: '善良正直', label: '善良正直', icon: Sparkles },
            { value: '严谨认真', label: '严谨认真', icon: Target },
            { value: '热情开朗', label: '热情开朗', icon: Star }
          ],
          required: false
        },
        {
          id: 'achievements',
          type: 'multiple',
          question: `${answers.personName}有哪些值得骄傲的成就？`,
          subtitle: '选择TA在人生中的重要成就，可多选',
          options: [
            { value: '家庭美满', label: '家庭美满', icon: Users },
            { value: '事业有成', label: '事业有成', icon: Briefcase },
            { value: '教育子女', label: '教育子女', icon: GraduationCap },
            { value: '帮助他人', label: '帮助他人', icon: HandHeart },
            { value: '社区贡献', label: '社区贡献', icon: Building },
            { value: '专业成就', label: '专业成就', icon: Trophy },
            { value: '艺术创作', label: '艺术创作', icon: Palette },
            { value: '学术研究', label: '学术研究', icon: BookOpen },
            { value: '慈善公益', label: '慈善公益', icon: Heart },
            { value: '技艺传承', label: '技艺传承', icon: Handshake }
          ],
          required: false
        },
        {
          id: 'hobbies',
          type: 'multiple',
          question: `${answers.personName}平时喜欢做什么？`,
          subtitle: '选择TA的兴趣爱好，可多选',
          options: [
            { value: '阅读写作', label: '阅读写作', icon: BookOpen },
            { value: '音乐艺术', label: '音乐艺术', icon: Music },
            { value: '运动健身', label: '运动健身', icon: Dumbbell },
            { value: '园艺种植', label: '园艺种植', icon: Flower },
            { value: '烹饪美食', label: '烹饪美食', icon: ChefHat },
            { value: '旅行探索', label: '旅行探索', icon: Plane },
            { value: '摄影记录', label: '摄影记录', icon: Camera },
            { value: '手工制作', label: '手工制作', icon: Scissors },
            { value: '棋牌游戏', label: '棋牌游戏', icon: Target },
            { value: '社交聚会', label: '社交聚会', icon: PartyPopper }
          ],
          required: false
        },
        {
          id: 'specialMemory',
          type: 'textarea',
          question: `您与${answers.personName}最珍贵的回忆是什么？`,
          subtitle: '分享一个特别的回忆，这将帮助AI创作更个性化的纪念文案',
          placeholder: '分享一个特别的回忆...',
          required: false
        }
      )
    } else if (answers.writingMethod === 'self-written') {
      baseQuestions.push({
        id: 'specialMemory',
        type: 'textarea',
        question: `请为${answers.personName}写下纪念文案`,
        subtitle: '用您的话语，表达对TA最深的怀念',
        placeholder: '在这里写下您的纪念文案...',
        required: true
      })
    }

    // 添加创建者信息问题（如果用户未登录或需要补充信息）
    if (!user) {
      baseQuestions.push({
        id: 'creatorName',
        type: 'text',
        question: '请告诉我们您的姓名',
        subtitle: '作为纪念页的创建者',
        placeholder: '您的姓名',
        required: true
      })
    }

    return baseQuestions
  }

  const questions = getQuestions()

  // 自动计算年龄
  useEffect(() => {
    if (answers.birthDate && answers.passingDate) {
      const birthDate = new Date(answers.birthDate)
      const passingDate = new Date(answers.passingDate)
      
      let age = passingDate.getFullYear() - birthDate.getFullYear()
      const monthDiff = passingDate.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && passingDate.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (answers.age !== age.toString() && age >= 0) {
        setAnswers(prev => ({ ...prev, age: age.toString() }))
      }
    }
  }, [answers.birthDate, answers.passingDate])

  function transitionToNext() {
    setIsTransitioning(true)
    setShowContinueButton(false)
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        // 最后一个问题，提交表单
        handleSubmit()
      }
      setShowContinueButton(true)
      setIsTransitioning(false)
    }, 600)
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
      } else if (question.type === 'photos') {
        if (!Array.isArray(answers.photos) || answers.photos.length === 0) {
          alert('请至少上传一张照片')
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
    }, 300)
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

  async function generateAIContent() {
    if (isGenerating) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-person-obituary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName: answers.personName,
          relationship: answers.relationship,
          occupation: answers.occupation,
          location: answers.location,
          age: answers.age,
          birthDate: answers.birthDate,
          passingDate: answers.passingDate,
          personalityTraits: answers.personalityTraits,
          achievements: answers.achievements,
          hobbies: answers.hobbies,
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
        setAnswers(prev => ({ ...prev, aiGeneratedObituary: result.content }))
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

  // 处理提交
  async function handleSubmit() {
    if (!user) {
      alert('请先登录')
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 先上传图片
      const imageData = await uploadImages()
      
      // 创建纪念页
      const memorialData = {
        type: 'HUMAN',
        subjectName: answers.personName,
        subjectType: answers.relationship,
        birthDate: answers.birthDate,
        deathDate: answers.passingDate,
        age: answers.age,
        relationship: answers.relationship,
        occupation: answers.occupation,
        location: answers.location,
        story: answers.aiGeneratedObituary || answers.specialMemory || '',
        personalityTraits: answers.personalityTraits,
        favoriteActivities: answers.hobbies,
        creatorName: answers.creatorName || user.name,
        creatorEmail: answers.creatorEmail || user.email,
        creatorPhone: answers.creatorRelationship,
        authorId: user.id,
        imageData: imageData,
        isPublic: true
      }

      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(memorialData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建纪念页失败')
      }

      const result = await response.json()
      console.log('创建纪念页成功:', result)
      
      // 跳转到纪念页详情
      router.push(`/community-person-obituaries/${result.memorial.slug}`)
      
    } catch (error: any) {
      console.error('创建纪念页失败:', error)
      alert(error.message || '创建纪念页失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 上传图片
  async function uploadImages() {
    if (!answers.photos || answers.photos.length === 0) {
      return []
    }

    const imageData = []
    
    for (let i = 0; i < answers.photos.length; i++) {
      const file = answers.photos[i]
      const formDataObj = new FormData()
      formDataObj.append('file', file)

      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataObj
        })

        if (!response.ok) {
          throw new Error(`上传图片 ${file.name} 失败`)
        }

        const data = await response.json()
        imageData.push({
          url: data.url,
          filename: data.filename || file.name,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          isMain: i === 0 // 第一张作为主图
        })
      } catch (error) {
        console.error('图片上传失败:', error)
        throw new Error(`图片上传失败: ${file.name}`)
      }
    }

    return imageData
  }

  // 键盘事件
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Enter键：进入下一题
      if (e.key === 'Enter' && !e.shiftKey && showContinueButton && !isTransitioning) {
        const question = questions[currentQuestion]
        if (!question) return
        
        if (question.type === 'text' || question.type === 'date') {
          const currentValue = answers[question.id as keyof FormData]
          if (question.required && (!currentValue || (typeof currentValue === 'string' && !currentValue.trim()))) {
            return
          }
        }
        
        if (question.type === 'textarea' && (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
          return
        }
        
        e.preventDefault()
        nextQuestion()
      }
      
      // Escape键或Backspace键：返回上一题
      if ((e.key === 'Escape' || e.key === 'Backspace') && !isTransitioning && currentQuestion > 0) {
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
    <div className="flex gap-4 mt-10 items-center justify-center">
      {currentQuestion > 0 && (
        <button
          className={`bg-transparent text-gray-600 border border-gray-300 py-3 px-6 text-base cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg ${
            showContinueButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
          onClick={previousQuestion}
        >
          ← 返回
        </button>
      )}
      <button
        className={`bg-black text-white border-none py-3 px-8 text-base cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg ${
          showContinueButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        onClick={nextQuestion}
        disabled={isSubmitting}
      >
        {currentQuestion === questions.length - 1 ? (isSubmitting ? '创建中...' : '创建纪念页') : '继续'}
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white z-50" style={{ overflow: 'hidden' }}>
      {/* 返回按钮 */}
      {currentQuestion > 0 && !isTransitioning && (
        <button
          onClick={previousQuestion}
          className="fixed top-5 left-5 w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-300 hover:shadow-lg z-50 group"
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
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-400 ${
              i <= (currentQuestion / questions.length) * 10 ? 'bg-black' : 'bg-black/20'
            }`}
          />
        ))}
      </div>
      
      {/* 键盘提示和品牌标识 */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-gray-300 mb-2 font-light">
          {currentQuestion > 0 && '← ESC 返回'} {currentQuestion < questions.length - 1 && '回车 继续 →'}
        </div>
        <div className="text-sm text-gray-400 font-light">
          永念
        </div>
      </div>

      {/* 当前问题 */}
      {currentQuestion < questions.length && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-600 ease-out ${
          isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
        }`}>
          <h1 className="text-2xl md:text-4xl font-light text-gray-900 text-center mb-8 md:mb-12 leading-tight max-w-4xl">
            {currentQuestionData.question}
          </h1>
          
          {currentQuestionData.subtitle && (
            <div className="text-base text-gray-500 text-center mb-8 font-light">
              {currentQuestionData.subtitle}
            </div>
          )}

          {/* 文本输入 */}
          {currentQuestionData.type === 'text' && (
            <>
              <input
                type="text"
                placeholder={currentQuestionData.placeholder}
                className="border-0 border-b-2 border-gray-200 bg-transparent outline-none text-xl md:text-2xl py-4 text-center w-full max-w-lg transition-all duration-300 focus:border-black"
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
                className="border-0 border-b-2 border-gray-200 bg-transparent outline-none text-xl md:text-2xl py-4 text-center w-full max-w-lg transition-all duration-300 focus:border-black"
                value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
              />
              {renderNavigationButtons()}
            </>
          )}

          {/* 选项按钮 */}
          {currentQuestionData.type === 'options' && (
            <div className={`grid gap-4 max-w-2xl w-full ${
              currentQuestionData.options!.length <= 2 ? 'grid-cols-1' : 
              currentQuestionData.options!.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {currentQuestionData.options!.map((option) => (
                <button
                  key={option.value}
                  className={`border border-gray-200 bg-white p-5 text-center cursor-pointer transition-all duration-300 text-lg hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg ${
                    'description' in option ? 'text-left' : ''
                  }`}
                  onClick={() => selectOption(option.value, currentQuestionData.id)}
                >
                  {('icon' in option && (option as any).icon) ? (
                    <div className="w-8 h-8 mx-auto mb-2 text-gray-600">
                      {React.createElement((option as any).icon, { className: "w-full h-full" })}
                    </div>
                  ) : ('icon' in option && option.icon && (
                    <div className="mb-2 text-center">
                      <option.icon className="w-8 h-8 mx-auto" />
                    </div>
                  ))}
                  <div className={`${'description' in option ? 'font-medium mb-2' : ''}`}>
                    {option.label}
                  </div>
                  {'description' in option && (
                    <div className="text-sm text-gray-500 mt-1 leading-relaxed">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
                {currentQuestionData.options!.map((option) => {
                  const isSelected = (answers[currentQuestionData.id as keyof FormData] as string[] || []).includes(option.value)
                  return (
                    <button
                      key={option.value}
                      className={`border p-5 text-center cursor-pointer transition-all duration-300 text-lg hover:-translate-y-1 hover:shadow-lg ${
                        isSelected 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleMultiple(option.value, currentQuestionData.id)}
                    >
                      {('icon' in option && (option as any).icon) ? (
                        <div className="w-6 h-6 mx-auto mb-1 text-gray-600">
                          {React.createElement((option as any).icon, { className: "w-full h-full" })}
                        </div>
                      ) : ('icon' in option && option.icon && (
                        <div className="mb-1 flex justify-center">
                          <option.icon className="w-6 h-6" />
                        </div>
                      ))}
                      <div>{option.label}</div>
                    </button>
                  )
                })}
              </div>
              {renderNavigationButtons()}
            </>
          )}

          {/* 照片上传 */}
          {currentQuestionData.type === 'photos' && (
            <>
              <div className="w-full max-w-2xl">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="hidden"
                  id="photo-upload"
                />
                
                <label
                  htmlFor="photo-upload"
                  className="border-2 border-dashed border-gray-300 bg-white p-12 text-center cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 block"
                >
                  <div className="text-4xl mb-4">照片</div>
                  <div className="text-lg mb-2 text-gray-600">点击上传照片</div>
                  <div className="text-sm text-gray-400">支持 PNG、JPG、GIF，单张最大 5MB，最多 10 张</div>
                </label>

                {answers.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {answers.photos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-24 object-cover border border-gray-200"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-black text-white text-xs px-2 py-1">
                            主图
                          </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => movePhotoToFirst(index)}
                              className="bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="设为主图"
                            >
                              ⭐
                            </button>
                          )}
                          <button
                            onClick={() => removePhoto(index)}
                            className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="border border-gray-200 bg-white outline-none text-lg p-6 w-full min-h-32 resize-y transition-all duration-300 focus:border-black focus:shadow-sm"
                  value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                  onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
                  rows={4}
                  autoFocus
                />
                
                {/* AI生成按钮 - 仅在AI生成模式下显示 */}
                {answers.writingMethod === 'ai-generated' && currentQuestionData.id === 'specialMemory' && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className={`flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg transition-all duration-300 hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg ${
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
                          <div className="text-lg">智能</div>
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
                    className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                    onClick={transitionToNext}
                  >
                    跳过这一步
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}