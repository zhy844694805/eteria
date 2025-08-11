"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Users, Lock } from 'lucide-react'

interface AudioFile {
  file: File
  url: string
  duration?: number
}

interface ChatRecord {
  id: string
  content: string
  timestamp: string
  speaker: 'deceased' | 'other'
}

interface Memorial {
  id: string
  title: string
  subjectName: string
  type: 'PET' | 'HUMAN'
  slug: string
  age?: string | null
  images: Array<{
    url: string
    thumbnailUrl: string | null
  }>
}


interface FormData {
  selectedMemorial: string
  voiceModelName: string
  uploadedAudios: AudioFile[]
  chatRecords: ChatRecord[]
  allowPublicUse: boolean
}

export function DigitalLifeForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [answers, setAnswers] = useState<FormData>({
    selectedMemorial: '',
    voiceModelName: '',
    uploadedAudios: [],
    chatRecords: [],
    allowPublicUse: false
  })

  // 音频录制相关状态
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // 临时输入状态
  const [manualChatInput, setManualChatInput] = useState('')
  const [userMemorials, setUserMemorials] = useState<Memorial[]>([])
  const [isLoadingMemorials, setIsLoadingMemorials] = useState(false)
  
  // 数字生命创建状态
  const [isCreatingModel, setIsCreatingModel] = useState(false)

  // 获取用户的纪念页面
  useEffect(() => {
    if (user) {
      fetchUserMemorials()
    }
  }, [user])

  const fetchUserMemorials = async () => {
    setIsLoadingMemorials(true)
    try {
      const response = await fetch('/api/memorials/user', {
        credentials: 'include', // 包含cookies进行认证
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const humanMemorials = data.memorials.filter((m: Memorial) => m.type === 'HUMAN')
        setUserMemorials(humanMemorials)
      } else {
        const errorData = await response.json()
        console.error('获取纪念页面失败:', errorData.error || '未知错误')
      }
    } catch (error) {
      console.error('获取纪念页面失败:', error)
    } finally {
      setIsLoadingMemorials(false)
    }
  }

  // 动态生成问题列表
  const getQuestions = () => {
    const selectedMemorialName = userMemorials.find(m => m.id === answers.selectedMemorial)?.subjectName || '逝者'
    
    const questionList = [
      {
        id: 'selectedMemorial',
        type: 'options',
        question: '选择要创建数字生命的逝者',
        subtitle: '从已有的纪念页面中选择',
        options: userMemorials.map(memorial => ({
          value: memorial.id,
          label: memorial.subjectName,
          emoji: memorial.images.length > 0 ? null : '👤',
          imageUrl: memorial.images.length > 0 ? memorial.images[0].thumbnailUrl || memorial.images[0].url : null,
          description: memorial.title === memorial.subjectName 
            ? (memorial.type === 'HUMAN' && memorial.age ? `${memorial.age}岁` : `${memorial.type === 'HUMAN' ? '人类' : '宠物'}纪念页`)
            : memorial.title
        })),
        required: true
      },
      {
        id: 'allowPublicUse',
        type: 'options',
        question: '是否允许其他用户与这个数字生命对话？',
        subtitle: '在纪念页面中，其他访客可以与数字生命对话',
        options: [
          { value: 'true', label: '允许', icon: Users, description: '其他用户可以在纪念页面中与数字生命对话' },
          { value: 'false', label: '仅限自己', icon: Lock, description: '只有您可以与此数字生命对话' }
        ],
        required: true
      },
      {
        id: 'uploadedAudios',
        type: 'audio',
        question: `上传${selectedMemorialName}的音频样本`,
        subtitle: '可以是录音、语音消息、视频中的声音等',
        required: true
      },
      {
        id: 'chatRecords',
        type: 'chat',
        question: `添加${selectedMemorialName}的聊天记录`,
        subtitle: '微信聊天记录或手动输入TA说过的话',
        required: true
      }
    ]
    
    console.log('生成的问题列表:', questionList)
    console.log('问题总数:', questionList.length)
    questionList.forEach((q, index) => {
      console.log(`问题${index}: ${q.question} (类型: ${q.type})`)
    })
    return questionList
  }

  const questions = getQuestions()
  const currentQuestionData = questions[currentQuestion]
  
  // 添加调试信息
  console.log('当前状态 - 问题索引:', currentQuestion, '问题总数:', questions.length, 'isCreatingModel:', isCreatingModel)

  // 处理输入变化
  function handleInputChange(value: string, fieldId: string) {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
    setShowContinueButton(true)
  }

  // 选择选项
  function selectOption(value: string, fieldId: string) {
    if (isTransitioning) return
    
    if (fieldId === 'allowPublicUse') {
      setAnswers(prev => ({ ...prev, [fieldId]: value === 'true' }))
    } else {
      setAnswers(prev => ({ ...prev, [fieldId]: value }))
    }
    
    // 延迟自动进入下一题
    setTimeout(() => {
      transitionToNext()
    }, 800)
  }

  // 过渡到下一题
  function transitionToNext() {
    console.log('=== transitionToNext 开始执行 ===')
    console.log('当前问题:', currentQuestion, '总问题数:', questions.length)
    
    setIsTransitioning(true)
    setShowContinueButton(false)
    
    setTimeout(() => {
      console.log('判断逻辑：currentQuestion =', currentQuestion, 'questions.length - 1 =', questions.length - 1)
      
      // 现在只有4个问题，最后一个是chatRecords
      if (currentQuestion < questions.length - 1) {
        console.log('还有下一题，切换到问题', currentQuestion + 1)
        setCurrentQuestion(prev => prev + 1)
        setShowContinueButton(true)
        setIsTransitioning(false)
      } else {
        console.log('完成最后一个问题，开始创建数字生命')
        // 完成最后一个问题，创建数字生命
        setIsTransitioning(false)
        createDigitalLife()
      }
    }, 600)
  }

  // 下一题
  function nextQuestion() {
    if (isTransitioning) return
    
    const question = questions[currentQuestion]
    const currentValue = answers[question.id as keyof FormData]
    
    // 验证必填项
    if (question.required) {
      if (question.type === 'audio') {
        if (!Array.isArray(answers.uploadedAudios) || answers.uploadedAudios.length === 0) {
          toast.error('请至少上传一个音频文件')
          return
        }
      } else if (question.type === 'chat') {
        if (!Array.isArray(answers.chatRecords) || answers.chatRecords.length === 0) {
          toast.error('请至少添加一条聊天记录')
          return
        }
      } else if (!currentValue || (typeof currentValue === 'string' && !currentValue.trim())) {
        toast.error('请填写必填信息')
        return
      }
    }
    
    transitionToNext()
  }

  // 上一题
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

  // 处理聊天记录文件上传
  const handleChatFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      try {
        const lines = content.split('\n').filter(line => line.trim())
        const records: ChatRecord[] = []
        
        lines.forEach((line, index) => {
          const trimmedLine = line.trim()
          if (trimmedLine) {
            const isDeceasedMessage = index % 2 === 0 || 
                                    trimmedLine.includes('我') || 
                                    trimmedLine.includes('自己')
            
            records.push({
              id: `chat-${index}`,
              content: trimmedLine,
              timestamp: new Date().toISOString(),
              speaker: isDeceasedMessage ? 'deceased' : 'other'
            })
          }
        })
        
        setAnswers(prev => ({ ...prev, chatRecords: [...prev.chatRecords, ...records] }))
        toast.success(`已导入 ${records.length} 条聊天记录`)
        setShowContinueButton(true)
      } catch (error) {
        toast.error('聊天记录格式解析失败，请检查文件格式')
      }
    }
    
    reader.readAsText(file)
    event.target.value = ''
  }, [])

  // 添加手动聊天记录
  const addManualChatRecord = useCallback(() => {
    if (!manualChatInput.trim()) return
    
    const newRecord: ChatRecord = {
      id: `manual-${Date.now()}`,
      content: manualChatInput.trim(),
      timestamp: new Date().toISOString(),
      speaker: 'deceased'
    }
    
    setAnswers(prev => ({ ...prev, chatRecords: [...prev.chatRecords, newRecord] }))
    setManualChatInput('')
    toast.success('已添加聊天记录')
    setShowContinueButton(true)
  }, [manualChatInput])

  // 删除聊天记录
  const removeChatRecord = useCallback((id: string) => {
    setAnswers(prev => ({ 
      ...prev, 
      chatRecords: prev.chatRecords.filter(record => record.id !== id) 
    }))
  }, [])

  // 处理音频文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      if (!file.type.startsWith('audio/')) {
        toast.error(`${file.name} 不是有效的音频文件`)
        return
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} 文件过大，请选择小于50MB的文件`)
        return
      }
      
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      
      audio.addEventListener('loadedmetadata', () => {
        const newAudio: AudioFile = {
          file,
          url,
          duration: audio.duration
        }
        
        setAnswers(prev => ({ 
          ...prev, 
          uploadedAudios: [...prev.uploadedAudios, newAudio] 
        }))
        toast.success(`已添加音频: ${file.name}`)
        setShowContinueButton(true)
      })
    })
    
    event.target.value = ''
  }, [])

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], `录音_${Date.now()}.wav`, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        
        const newAudio: AudioFile = {
          file: audioFile,
          url,
          duration: recordingTime
        }
        
        setAnswers(prev => ({ 
          ...prev, 
          uploadedAudios: [...prev.uploadedAudios, newAudio] 
        }))
        toast.success('录音已保存')
        setShowContinueButton(true)
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('录音失败:', error)
      toast.error('无法访问麦克风，请检查权限设置')
    }
  }, [recordingTime])

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }, [isRecording])

  // 删除音频
  const removeAudio = useCallback((index: number) => {
    const audio = answers.uploadedAudios[index]
    URL.revokeObjectURL(audio.url)
    
    setAnswers(prev => ({
      ...prev,
      uploadedAudios: prev.uploadedAudios.filter((_, i) => i !== index)
    }))
  }, [answers.uploadedAudios])

  // 播放/暂停音频
  const toggleAudio = useCallback((url: string, id: string) => {
    const audio = audioRefs.current[id] || new Audio(url)
    audioRefs.current[id] = audio
    
    if (currentlyPlaying === id) {
      audio.pause()
      setCurrentlyPlaying(null)
    } else {
      Object.values(audioRefs.current).forEach(a => a.pause())
      setCurrentlyPlaying(null)
      
      audio.play()
      setCurrentlyPlaying(id)
      
      audio.onended = () => {
        setCurrentlyPlaying(null)
      }
    }
  }, [currentlyPlaying])

  // 创建数字生命
  const createDigitalLife = async () => {
    console.log('=== createDigitalLife 函数开始执行 ===')
    
    if (!user) {
      console.log('用户未登录，终止创建')
      toast.error('请先登录')
      return
    }
    
    if (!answers.selectedMemorial) {
      toast.error('请选择要创建数字生命的纪念馆')
      return
    }
    
    const selectedMemorial = userMemorials.find(m => m.id === answers.selectedMemorial)
    if (!selectedMemorial) {
      toast.error('选择的纪念馆不存在')
      return
    }
    
    console.log('用户已登录，开始创建数字生命...')
    console.log('当前用户:', user)
    console.log('选择的纪念馆:', selectedMemorial)
    console.log('设置 isCreatingModel = true')
    setIsCreatingModel(true)
    
    try {
      console.log('进入 try 块')
      
      // 准备创建数据
      const createData = {
        memorialId: answers.selectedMemorial,
        name: selectedMemorial.subjectName,
        description: `${selectedMemorial.subjectName}的数字生命`,
        audioSamples: answers.uploadedAudios.map(audio => audio.file.name), // 这里应该是实际的文件路径
        chatRecords: answers.chatRecords,
        allowPublicChat: answers.allowPublicUse
      }
      
      console.log('创建数据:', createData)
      
      // 调用创建API
      const response = await fetch('/api/digital-lives', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API错误响应:', errorData)
        throw new Error(errorData.error || '创建数字生命失败')
      }
      
      const data = await response.json()
      console.log('创建成功:', data)
      
      console.log('显示成功提示')
      toast.success('数字生命创建成功！')
      
      // 短暂延迟后跳转到数字生命首页
      setTimeout(() => {
        router.push('/digital-life-home')
      }, 1500)
      
    } catch (error: any) {
      console.error('创建数字生命失败:', error)
      toast.error(error.message || '创建数字生命失败')
    } finally {
      console.log('进入 finally 块，设置 isCreatingModel = false')
      setIsCreatingModel(false)
      console.log('=== createDigitalLife 函数执行完成 ===')
    }
  }


  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 键盘事件
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Enter键：进入下一题
      if (e.key === 'Enter' && !e.shiftKey && showContinueButton && !isTransitioning) {
        const question = questions[currentQuestion]
        if (!question) return
        
        if (question.type === 'text') {
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
        disabled={isCreatingModel}
      >
        {isCreatingModel ? '创建中...' : 
         currentQuestion === questions.length - 1 ? '创建数字生命' : '继续'}
      </button>
    </div>
  )

  if (!user) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-800 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-8">创建数字生命需要先登录您的账户</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-black text-white border-none py-3 px-8 text-base cursor-pointer transition-all duration-300 hover:bg-gray-800"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }

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
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-400 ${
              i <= (currentQuestion / questions.length) * 8 ? 'bg-black' : 'bg-black/20'
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
          永念 · 数字生命
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

          {/* 文本域输入 */}
          {currentQuestionData.type === 'textarea' && (
            <>
              <textarea
                placeholder={currentQuestionData.placeholder}
                className="border-0 border-b-2 border-gray-200 bg-transparent outline-none text-xl md:text-2xl py-4 text-center w-full max-w-lg transition-all duration-300 focus:border-black resize-none"
                value={answers[currentQuestionData.id as keyof FormData] as string || ''}
                onChange={(e) => handleInputChange(e.target.value, currentQuestionData.id)}
                rows={3}
              />
              {renderNavigationButtons()}
            </>
          )}

          {/* 选项按钮 */}
          {currentQuestionData.type === 'options' && (
            <>
              {currentQuestionData.id === 'selectedMemorial' && isLoadingMemorials ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载纪念馆...</p>
                </div>
              ) : currentQuestionData.id === 'selectedMemorial' && userMemorials.length === 0 ? (
                <div className="text-center max-w-lg">
                  <div className="text-4xl mb-4">👤</div>
                  <p className="text-lg text-gray-600 mb-4">您还没有创建任何人类纪念馆</p>
                  <p className="text-sm text-gray-500 mb-6">数字生命功能需要先创建一个人类纪念馆</p>
                  <button
                    onClick={() => router.push('/create-person-obituary')}
                    className="bg-purple-600 text-white border-none py-3 px-6 text-base cursor-pointer transition-all duration-300 hover:bg-purple-700"
                  >
                    创建人类纪念馆
                  </button>
                </div>
              ) : (
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
                      {('imageUrl' in option && (option as any).imageUrl) ? (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-gray-100">
                          <img 
                            src={(option as any).imageUrl} 
                            alt={option.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : ('icon' in option && (option as any).icon) ? (
                        <div className="w-8 h-8 mx-auto mb-2 text-gray-600">
                          {React.createElement((option as any).icon, { className: "w-full h-full" })}
                        </div>
                      ) : ('emoji' in option && option.emoji && (
                        <div className="text-2xl mb-2 text-center">{option.emoji}</div>
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
            </>
          )}

          {/* 音频上传 */}
          {currentQuestionData.type === 'audio' && (
            <>
              <div className="w-full max-w-2xl">
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                
                <label
                  htmlFor="audio-upload"
                  className="border-2 border-dashed border-gray-300 bg-white p-12 text-center cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 block"
                >
                  <div className="text-4xl mb-4">🎵</div>
                  <div className="text-lg mb-2 text-gray-600">点击上传音频文件</div>
                  <div className="text-sm text-gray-400">支持 MP3、WAV、M4A 等格式，单个最大 50MB</div>
                </label>

                {/* 录音按钮 */}
                <div className="text-center mt-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`py-3 px-8 text-base cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isRecording 
                        ? 'bg-red-500 text-white border-none hover:bg-red-600' 
                        : 'bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isRecording ? `停止录音 (${formatTime(recordingTime)})` : '开始录音'}
                  </button>
                </div>

                {answers.uploadedAudios.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    {answers.uploadedAudios.map((audio, index) => (
                      <div key={index} className="relative group border border-gray-200 p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleAudio(audio.url, `upload-${index}`)}
                              className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center"
                            >
                              {currentlyPlaying === `upload-${index}` ? '⏸' : '▶'}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                                {audio.file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {audio.duration ? formatTime(Math.round(audio.duration)) : '加载中...'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAudio(index)}
                            className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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

          {/* 聊天记录 */}
          {currentQuestionData.type === 'chat' && (
            <>
              <div className="w-full max-w-2xl">
                <input
                  type="file"
                  accept=".txt,.json,.csv"
                  onChange={handleChatFileUpload}
                  className="hidden"
                  id="chat-file-upload"
                />
                
                <label
                  htmlFor="chat-file-upload"
                  className="border-2 border-dashed border-gray-300 bg-white p-12 text-center cursor-pointer transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 block"
                >
                  <div className="text-4xl mb-4">💬</div>
                  <div className="text-lg mb-2 text-gray-600">点击上传聊天记录文件</div>
                  <div className="text-sm text-gray-400">支持 TXT、JSON、CSV 格式</div>
                </label>

                {/* 手动添加 */}
                <div className="mt-6">
                  <div className="text-center text-gray-500 mb-4">或者手动添加</div>
                  <div className="flex gap-3">
                    <textarea
                      value={manualChatInput}
                      onChange={(e) => setManualChatInput(e.target.value)}
                      placeholder="输入逝者说过的话..."
                      className="flex-1 border border-gray-200 p-3 text-sm resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <button
                      onClick={addManualChatRecord}
                      disabled={!manualChatInput.trim()}
                      className="bg-black text-white border-none py-3 px-6 text-sm cursor-pointer transition-all duration-300 hover:bg-gray-800 disabled:bg-gray-300"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {answers.chatRecords.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-3">已添加 {answers.chatRecords.length} 条记录</div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {answers.chatRecords.map((record) => (
                        <div key={record.id} className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 text-sm">
                          <div className="flex-1">
                            <div className="text-gray-900 line-clamp-2">
                              {record.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {record.speaker === 'deceased' ? '逝者' : '其他'}
                            </div>
                          </div>
                          <button
                            onClick={() => removeChatRecord(record.id)}
                            className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {renderNavigationButtons()}
            </>
          )}

          {/* 创建完成界面 */}
          {isCreatingModel && (
            <div className="text-center">
              <div className="text-4xl mb-8">✨</div>
              <div className="text-xl text-gray-600 mb-4">正在创建数字生命...</div>
              <div className="animate-spin w-12 h-12 border-2 border-gray-300 border-t-purple-600 rounded-full mx-auto mb-6"></div>
              <div className="text-sm text-gray-500">
                正在处理音频样本和聊天记录，请稍等...
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}