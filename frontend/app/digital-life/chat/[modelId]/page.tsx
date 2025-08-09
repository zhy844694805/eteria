"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface VoiceModel {
  id: string
  name: string
  description?: string
  memorial: {
    subjectName: string
  }
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  audioUrl?: string
}

export default function DigitalLifeChatPage({ 
  params 
}: { 
  params: Promise<{ modelId: string }> 
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [modelId, setModelId] = useState<string>('')
  const [voiceModel, setVoiceModel] = useState<VoiceModel | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setModelId(resolvedParams.modelId)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (modelId && user) {
      fetchVoiceModel()
    }
  }, [modelId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchVoiceModel = async () => {
    try {
      const response = await fetch(`/api/voice-models/${modelId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setVoiceModel(data.voiceModel)
      } else {
        toast.error('语音模型不存在或无权限访问')
        router.push('/digital-life-home')
      }
    } catch (error) {
      console.error('获取语音模型失败:', error)
      toast.error('加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isSending || !voiceModel) return

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
      const response = await fetch('/api/ai/digital-life-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `以${voiceModel.memorial.subjectName}的身份回复以下消息：

用户消息：${userMessage.content}

请以${voiceModel.memorial.subjectName}的口吻和语言风格回复，保持亲切自然的对话感觉。`,
          maxTokens: 300
        })
      })

      if (!response.ok) {
        throw new Error('AI服务调用失败')
      }

      const data = await response.json()
      const aiResponse = data.text || data.content || '抱歉，我现在无法回复。'

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }

      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送失败，请稍后重试')
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

  if (!user) {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!voiceModel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-light text-gray-800 mb-4">数字生命不存在</h2>
          <button
            onClick={() => router.push('/digital-life-home')}
            className="bg-black text-white px-6 py-3 text-sm tracking-wide hover:bg-gray-800 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 头部 */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/digital-life-home')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← 返回
            </button>
            <div>
              <h1 className="text-lg font-normal text-gray-900">
                {voiceModel.name}
              </h1>
              <p className="text-sm text-gray-500">
                与 {voiceModel.memorial.subjectName} 的数字生命对话
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 对话区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">💖</div>
                <p className="text-gray-500 mb-2">开始与 {voiceModel.memorial.subjectName} 对话吧</p>
                <p className="text-sm text-gray-400">基于AI技术重现的数字生命，让思念有所寄托</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.isUser
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`想对 ${voiceModel.memorial.subjectName} 说些什么...`}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                disabled={isSending}
                maxLength={200}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !currentMessage.trim()}
                className="bg-black text-white px-6 py-3 text-sm tracking-wide hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSending ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}