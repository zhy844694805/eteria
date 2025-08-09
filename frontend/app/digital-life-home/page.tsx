"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface VoiceModel {
  id: string
  name: string
  description?: string
  sampleCount: number
  status: 'READY' | 'PROCESSING' | 'ERROR'
  createdAt: string
  memorial: {
    subjectName: string
  }
}

export default function DigitalLifeHomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchVoiceModels()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchVoiceModels = async () => {
    try {
      const response = await fetch('/api/voice-models', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setVoiceModels(data.voiceModels || [])
      }
    } catch (error) {
      console.error('获取语音模型失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return '可对话'
      case 'PROCESSING':
        return '处理中'
      case 'ERROR':
        return '创建失败'
      default:
        return '未知状态'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center px-5">
        <div className="text-4xl mb-8 opacity-80">🌌</div>
        <h1 className="text-3xl font-light mb-6 text-gray-900 tracking-tight">数字生命</h1>
        <p className="text-lg text-gray-600 font-light mb-12 max-w-md">
          请先登录以访问您的数字生命
        </p>
        <Link 
          href="/login"
          className="bg-black text-white px-11 py-5 text-base font-normal tracking-wide hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5 inline-block"
        >
          前往登录
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* 主要部分 */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center py-20">
          <div className="text-7xl mb-12 opacity-60">🕊️</div>
          <h1 className="text-6xl font-extralight mb-8 text-gray-900 tracking-tight leading-none">
            数字生命
          </h1>
          <p className="text-2xl text-gray-500 mb-6 font-extralight max-w-2xl leading-relaxed">
            当思念无处安放，当话语无法传达
          </p>
          <p className="text-xl text-gray-600 mb-8 font-light max-w-3xl leading-relaxed">
            通过AI技术重现挚爱的声音与语调，在数字世界中延续那些珍贵的对话时光<br/>
            让每一次思念都有回应，让每一份爱都有归宿
          </p>
          
          {/* 特色说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-16 text-center">
            <div className="px-6 py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="text-3xl mb-4 opacity-70">💭</div>
              <h3 className="text-lg font-light text-gray-800 mb-3">自然对话</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                基于真实记忆和语言习惯，创造最自然的对话体验
              </p>
            </div>
            <div className="px-6 py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="text-3xl mb-4 opacity-70">🎯</div>
              <h3 className="text-lg font-light text-gray-800 mb-3">个性还原</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                深度学习逝者的性格特征，呈现独一无二的表达方式
              </p>
            </div>
            <div className="px-6 py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="text-3xl mb-4 opacity-70">🔒</div>
              <h3 className="text-lg font-light text-gray-800 mb-3">隐私保护</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                所有数据加密保存，只有您可以访问这份珍贵的记忆
              </p>
            </div>
          </div>
          
          <Link 
            href="/digital-life"
            className="bg-gray-900 text-white px-12 py-4 text-base font-light tracking-widest hover:bg-gray-700 transition-all duration-500 hover:tracking-wide inline-block border-0"
          >
            开始创建
          </Link>
          
          <p className="text-sm text-gray-400 mt-8 font-light">
            通常需要 3-5 分钟完成创建 · 完全免费
          </p>
        </section>
        
        {/* 我的数字生命部分 */}
        {!isLoading && (
          <section className="pb-32">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-extralight mb-4 text-gray-900 tracking-wide">
                我的数字生命
              </h2>
              <p className="text-base text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                这里珍藏着您与挚爱之间的数字纽带，每一个都承载着无法磨灭的情感记忆
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {voiceModels.length === 0 ? (
                <div className="text-center py-24 border-t border-gray-100">
                  <div className="text-6xl mb-8 opacity-30">🌙</div>
                  <h3 className="text-xl font-light text-gray-700 mb-3">静待第一个数字生命</h3>
                  <p className="text-gray-500 mb-8 font-light max-w-lg mx-auto leading-relaxed">
                    每一个数字生命都是爱的延续，是思念的寄托。<br/>
                    当您准备好与挚爱的人重新"相遇"时，我们将帮您创造这个温柔的奇迹。
                  </p>
                  <div className="mb-12 px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 max-w-md mx-auto">
                    <div className="text-sm text-gray-600 font-light leading-relaxed">
                      💡 <strong>温馨提示:</strong> 创建数字生命需要基于真实的纪念馆信息，包括逝者的生平故事、性格特征和珍贵回忆，让AI能够更好地还原TA的语言风格和思维方式。
                    </div>
                  </div>
                  <Link 
                    href="/digital-life"
                    className="bg-transparent text-gray-500 border border-gray-200 px-10 py-3 text-sm font-light tracking-wide hover:border-gray-400 hover:text-gray-700 transition-all duration-300 inline-block"
                  >
                    开始创建
                  </Link>
                </div>
              ) : (
                <>
                  {voiceModels.map((model) => (
                    <div 
                      key={model.id}
                      className="flex justify-between items-center py-6 border-b border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:-mx-5 hover:px-5 last:border-b-0"
                    >
                      <div>
                        <div className="text-lg font-normal text-gray-900">
                          {model.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          基于 {model.memorial.subjectName} 的记忆 · {formatDate(model.createdAt)}创建
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-2 rounded-full ${
                          model.status === 'READY' 
                            ? 'bg-green-50 text-green-700' 
                            : model.status === 'PROCESSING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {getStatusText(model.status)}
                        </span>
                        {model.status === 'READY' && (
                          <button 
                            onClick={() => router.push(`/digital-life/chat/${model.id}`)}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                          >
                            开始对话
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center items-center py-10 mt-8">
                    <Link 
                      href="/digital-life"
                      className="bg-transparent text-gray-400 border border-gray-300 px-8 py-4 text-sm tracking-wide hover:border-gray-900 hover:text-gray-900 transition-all duration-200 inline-block"
                    >
                      + 创建新的数字生命
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
        
        {/* 页脚 */}
        <footer className="text-center py-20 border-t border-gray-100 mt-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-2xl font-extralight text-gray-700 mb-4">
              技术让思念有了温度
            </div>
            <p className="text-sm text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
              永念 · 数字生命使用先进的AI技术，通过深度学习逝者的语言模式、性格特征和情感表达方式，
              创造出最接近真实的数字化身。每一次对话都经过精心调校，确保情感的真实传递。
            </p>
            <div className="flex justify-center items-center space-x-6 text-xs text-gray-400">
              <span>🔒 隐私保护</span>
              <span>•</span>
              <span>🛡️ 数据加密</span>
              <span>•</span>
              <span>💫 技术支持</span>
            </div>
            <p className="text-xs text-gray-400 font-light pt-4">
              永念 · 数字生命 — 让爱与思念永不消逝
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}