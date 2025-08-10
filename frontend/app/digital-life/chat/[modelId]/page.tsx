"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface DigitalLife {
  id: string
  name: string
  description?: string
  memorial: {
    id: string
    subjectName: string
    title: string
    isPublic: boolean
    images: Array<{
      url: string
      thumbnailUrl: string | null
    }>
  }
  creator: {
    id: string
    name: string
  }
  status: string
  allowPublicChat: boolean
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  audioUrl?: string
  isGeneratingAudio?: boolean
}

export default function DigitalLifeChatPage({ 
  params 
}: { 
  params: Promise<{ modelId: string }> 
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [digitalLifeId, setDigitalLifeId] = useState<string>('')
  const [digitalLife, setDigitalLife] = useState<DigitalLife | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setDigitalLifeId(resolvedParams.modelId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (digitalLifeId) {
      fetchDigitalLife()
    }
  }, [digitalLifeId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 生成语音
  const generateAudio = async (messageId: string, text: string) => {
    // 设置消息为生成语音状态
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isGeneratingAudio: true } : msg
    ))

    try {
      // 模拟语音生成延迟（2-3秒）
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // TODO: 这里将来调用真实的语音合成API
      // const response = await fetch('/api/voice-synthesis', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     text, 
      //     digitalLifeId,
      //     voiceModelId: digitalLife.voiceModelId 
      //   })
      // })
      
      // 模拟生成的音频URL（实际应该从API返回）
      const mockAudioUrl = `data:audio/wav;base64,mock-audio-${Date.now()}`
      
      // 更新消息添加音频URL
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, audioUrl: mockAudioUrl, isGeneratingAudio: false }
          : msg
      ))
      
    } catch (error) {
      console.error('语音生成失败:', error)
      // 生成失败，移除加载状态
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isGeneratingAudio: false } : msg
      ))
      toast.error('语音生成失败')
    }
  }

  // 播放/暂停音频
  const toggleAudio = async (messageId: string, audioUrl: string) => {
    if (playingAudioId === messageId) {
      // 暂停当前播放
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayingAudioId(null)
      }
    } else {
      // 播放新音频
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      // TODO: 实际播放音频文件
      // const audio = new Audio(audioUrl)
      // audioRef.current = audio
      // audio.play()
      // setPlayingAudioId(messageId)
      
      // 模拟播放（3秒后自动结束）
      setPlayingAudioId(messageId)
      setTimeout(() => {
        setPlayingAudioId(null)
      }, 3000)
    }
  }

  const fetchDigitalLife = async () => {
    try {
      const response = await fetch(`/api/digital-lives/${digitalLifeId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDigitalLife(data.digitalLife)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '数字生命不存在或无权限访问')
        router.push('/digital-life-home')
      }
    } catch (error) {
      console.error('获取数字生命失败:', error)
      toast.error('加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isSending || !digitalLife) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: currentMessage.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsSending(true)

    try {
      // 调用数字生命对话API
      const response = await fetch(`/api/digital-lives/${digitalLifeId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          userName: user?.name,
          userEmail: user?.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI服务调用失败')
      }

      const data = await response.json()
      const aiResponse = data.conversation.aiResponse || '抱歉，我现在无法回复。'

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isGeneratingAudio: false
      }

      setMessages(prev => [...prev, aiMessage])
      
      // 自动开始生成语音
      setTimeout(() => {
        generateAudio(aiMessage.id, aiResponse)
      }, 500)
      
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error(`发送失败：${error instanceof Error ? error.message : '请稍后重试'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 text-sm font-light">连接中...</p>
        </div>
      </div>
    )
  }

  if (!digitalLife) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-1 h-1 bg-gray-300 rounded-full mx-auto mb-8 opacity-60"></div>
          <h2 className="text-lg font-light text-gray-600 mb-6">数字生命暂时无法访问</h2>
          <button
            onClick={() => router.push('/digital-life-home')}
            className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-light tracking-wide hover:bg-gray-800 transition-all duration-200"
          >
            返回主页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      {/* 极简头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/digital-life-home')}
              className="flex items-center text-gray-400 hover:text-gray-700 transition-all duration-200 -ml-1 px-1 py-1"
            >
              <span className="text-lg">←</span>
            </button>
            <div className="text-center">
              <h1 className="text-lg font-light text-gray-800 tracking-wide">
                {digitalLife.memorial.subjectName}
              </h1>
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 opacity-70"></div>
            </div>
            <div className="w-6"></div> {/* 平衡布局 */}
          </div>
        </div>
      </header>

      {/* 对话区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            {messages.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-1 h-1 bg-gray-600 rounded-full mx-auto mb-8"></div>
                <p className="text-gray-800 text-base font-normal mb-4">
                  与 {digitalLife.memorial.subjectName} 开始对话
                </p>
                <p className="text-base text-gray-700 font-normal max-w-sm mx-auto leading-relaxed">
                  基于珍贵记忆重现的数字生命，每一次对话都是爱的延续
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-sm ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                    {/* 语音控制区域 - 仅AI消息显示 */}
                    {!message.isUser && (
                      <div className="flex items-center justify-center mb-3">
                        {message.isGeneratingAudio ? (
                          /* 语音生成中动画 */
                          <div className="flex items-center gap-2 text-gray-500">
                            <div className="flex gap-1">
                              <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                              <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                            <span className="text-xs font-light">生成语音中...</span>
                          </div>
                        ) : message.audioUrl ? (
                          /* 语音波浪播放控件 */
                          <button
                            onClick={() => toggleAudio(message.id, message.audioUrl!)}
                            className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-all duration-200"
                          >
                            {/* 波浪动画 */}
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                                    playingAudioId === message.id
                                      ? 'h-4 animate-pulse'
                                      : 'h-2'
                                  }`}
                                  style={{
                                    animationDelay: playingAudioId === message.id ? `${i * 0.1}s` : '0s',
                                    animationDuration: '0.8s'
                                  }}
                                ></div>
                              ))}
                            </div>
                            <span className="text-xs font-light">
                              {playingAudioId === message.id ? '播放中...' : '播放语音'}
                            </span>
                          </button>
                        ) : null}
                      </div>
                    )}
                    
                    <div
                      className={`px-5 py-4 ${
                        message.isUser
                          ? 'bg-gray-900 text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-normal">{message.content}</p>
                    </div>
                    <p className={`text-xs mt-2 font-normal ${
                      message.isUser 
                        ? 'text-gray-400 text-right' 
                        : 'text-gray-600 text-left'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-sm mr-12">
                  <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100/50">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 极简输入区域 */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-100/50 p-6">
            <div className="relative">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`与 ${digitalLife.memorial.subjectName} 对话...`}
                className="w-full bg-gray-100 border border-gray-200 rounded-full px-6 py-4 pr-14 text-sm font-normal text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                disabled={isSending}
                maxLength={200}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !currentMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}