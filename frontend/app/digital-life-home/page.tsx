"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Sparkles, MessageCircle, Target, Shield, Moon, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface DigitalLife {
  id: string
  name: string
  description?: string
  audioCount: number
  chatCount: number
  status: 'CREATING' | 'READY' | 'FAILED' | 'INACTIVE'
  conversationCount: number
  createdAt: string
  memorial: {
    id: string
    subjectName: string
    title: string
    images: Array<{
      url: string
      thumbnailUrl: string | null
    }>
  }
}

export default function DigitalLifeHomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [digitalLives, setDigitalLives] = useState<DigitalLife[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDigitalLives()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchDigitalLives = async () => {
    try {
      const response = await fetch('/api/digital-lives', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDigitalLives(data.digitalLives || [])
      }
    } catch (error) {
      console.error('获取数字生命失败:', error)
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
      case 'CREATING':
        return '创建中'
      case 'FAILED':
        return '创建失败'
      case 'INACTIVE':
        return '暂不可用'
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
      <ResponsiveNavigation currentPage="digital-life" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* 主要部分 */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center py-20 pt-20 lg:pt-32">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-8 sm:mb-12 text-gray-400">
            <Sparkles className="w-full h-full" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-6 sm:mb-8 text-gray-900 tracking-tight leading-none">
            数字生命
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 mb-4 sm:mb-6 font-extralight max-w-2xl leading-relaxed px-4">
            当思念无处安放，当话语无法传达
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 font-light max-w-3xl leading-relaxed px-4">
            通过AI技术重现挚爱的声音与语调，在数字世界中延续那些珍贵的对话时光<br className="hidden sm:block"/>
            <span className="sm:hidden"> </span>让每一次思念都有回应，让每一份爱都有归宿
          </p>
          
          {/* 特色说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mb-12 sm:mb-16 text-center px-4">
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-gray-500">
                <MessageCircle className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">自然对话</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                基于真实记忆和语言习惯，创造最自然的对话体验
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-gray-500">
                <Target className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">个性还原</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                深度学习逝者的性格特征，呈现独一无二的表达方式
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-gray-500">
                <Shield className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">隐私保护</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                所有数据加密保存，只有您可以访问这份珍贵的记忆
              </p>
            </div>
          </div>
          
          <Link 
            href="/digital-life"
            className="bg-gray-900 text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base font-light tracking-wide sm:tracking-widest hover:bg-gray-700 transition-all duration-500 hover:tracking-wide inline-block border-0"
          >
            开始创建
          </Link>
          
          <p className="text-xs sm:text-sm text-gray-400 mt-6 sm:mt-8 font-light">
            通常需要 3-5 分钟完成创建 · 完全免费
          </p>
        </section>
        
        {/* 我的数字生命部分 */}
        {!isLoading && (
          <section className="pb-20 sm:pb-32">
            <div className="text-center mb-12 sm:mb-20 px-4">
              <h2 className="text-2xl sm:text-3xl font-extralight mb-3 sm:mb-4 text-gray-900 tracking-wide">
                我的数字生命
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                这里珍藏着您与挚爱之间的数字纽带，每一个都承载着无法磨灭的情感记忆
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto px-4">
              {digitalLives.length === 0 ? (
                <div className="text-center py-16 sm:py-24 border-t border-gray-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-8 text-gray-300">
                    <Moon className="w-full h-full" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-light text-gray-700 mb-2 sm:mb-3">静待第一个数字生命</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 font-light max-w-lg mx-auto leading-relaxed">
                    每一个数字生命都是爱的延续，是思念的寄托。<br className="hidden sm:block"/>
                    <span className="sm:hidden"> </span>当您准备好与挚爱的人重新"相遇"时，我们将帮您创造这个温柔的奇迹。
                  </p>
                  <div className="mb-8 sm:mb-12 px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 max-w-md mx-auto">
                    <div className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" /> <strong>温馨提示:</strong> 创建数字生命需要基于真实的纪念馆信息，包括逝者的生平故事、性格特征和珍贵回忆，让AI能够更好地还原TA的语言风格和思维方式。
                    </div>
                  </div>
                  <Link 
                    href="/digital-life"
                    className="bg-transparent text-gray-500 border border-gray-200 px-6 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm font-light tracking-wide hover:border-gray-400 hover:text-gray-700 transition-all duration-300 inline-block"
                  >
                    开始创建
                  </Link>
                </div>
              ) : (
                <>
                  {digitalLives.map((digitalLife) => (
                    <div 
                      key={digitalLife.id}
                      className="flex justify-between items-center py-6 border-b border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:-mx-5 hover:px-5 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {digitalLife.memorial.images.length > 0 ? (
                            <img 
                              src={digitalLife.memorial.images[0].thumbnailUrl || digitalLife.memorial.images[0].url}
                              alt={digitalLife.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Sparkles className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-lg font-normal text-gray-900">
                            {digitalLife.name}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            基于 {digitalLife.memorial.subjectName} 的记忆 · {formatDate(digitalLife.createdAt)}创建
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {digitalLife.audioCount} 个音频样本 · {digitalLife.chatCount} 条聊天记录 · {digitalLife.conversationCount} 次对话
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-2 rounded-full ${
                          digitalLife.status === 'READY' 
                            ? 'bg-green-50 text-green-700' 
                            : digitalLife.status === 'CREATING'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {getStatusText(digitalLife.status)}
                        </span>
                        {digitalLife.status === 'READY' && (
                          <button 
                            onClick={() => router.push(`/digital-life/chat/${digitalLife.id}`)}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
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
      <Footer />
    </div>
  )
}