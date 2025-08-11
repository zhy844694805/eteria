"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, MessageCircle, MessageCircleHeart, Share2, User, Loader2, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { ShareModal } from "@/components/ui/share-modal"
import { ExportModal } from "@/components/ui/export-modal"
import { OptimizedAvatar, MemorialImageGrid } from "@/components/ui/optimized-image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Memorial {
  id: string
  title: string
  slug: string
  type: 'PET' | 'HUMAN'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
  subjectName: string
  birthDate?: string
  deathDate?: string
  age?: number
  relationship?: string
  occupation?: string
  location?: string
  story?: string
  memories?: string
  personalityTraits?: string
  favoriteThings?: string
  creatorName: string
  creatorEmail?: string
  creatorPhone?: string
  creatorRelation?: string
  viewCount: number
  candleCount: number
  messageCount: number
  likeCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
  author: {
    id: string
    name: string
    email: string
  }
  images: Array<{
    id: string
    url: string
    thumbnailUrl?: string
    previewUrl?: string
    placeholder?: string
    isMain: boolean
  }>
  messages: Array<{
    id: string
    content: string
    authorName: string
    createdAt: string
    user?: {
      id: string
      name: string
    }
  }>
  candles: Array<{
    id: string
    lightedBy: string
    message?: string
    createdAt: string
  }>
}


export default function PersonMemorialPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canLightCandle, setCanLightCandle] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  
  // 数字生命相关状态
  const [digitalLife, setDigitalLife] = useState<any>(null)
  const [showDigitalLife, setShowDigitalLife] = useState(false)

  // 检查今日是否可以点蜡烛
  const checkCandleStatus = async (memorialId: string) => {
    try {
      const requestBody: any = {
        memorialId: memorialId
      }

      if (user) {
        requestBody.userId = user.id
      }

      const response = await fetch('/api/candles/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()
        setCanLightCandle(data.canLight)
      }
    } catch (error) {
      console.error('检查点蜡烛状态失败:', error)
      setCanLightCandle(true)
    }
  }


  // 获取纪念页面的数字生命
  const fetchDigitalLife = async (memorialId: string) => {
    try {
      const response = await fetch(`/api/memorials/${memorialId}/digital-life`)
      if (response.ok) {
        const data = await response.json()
        if (data.digitalLife && data.digitalLife.status === 'READY' && data.digitalLife.allowPublicChat) {
          setDigitalLife(data.digitalLife)
          setShowDigitalLife(true)
        }
      }
    } catch (error) {
      console.error('获取数字生命失败:', error)
    }
  }




  // 跳转到数字生命聊天页面
  const handleDigitalLifeChat = () => {
    if (digitalLife && digitalLife.id) {
      router.push(`/digital-life/chat/${digitalLife.id}`)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchMemorialWithCancel = async () => {
      if (!params.slug) return

      try {
        setLoading(true)
        setError(null)
        
        const encodedSlug = encodeURIComponent(params.slug)
        const response = await fetch(`/api/memorials/slug/${encodedSlug}`, {
          signal: abortController.signal
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('纪念页不存在')
          } else {
            throw new Error('获取纪念页失败')
          }
          return
        }

        const data = await response.json()
        
        if (data.memorial.type !== 'HUMAN') {
          setError('这不是一个人员纪念页')
          return
        }

        if (!abortController.signal.aborted) {
          setMemorial(data.memorial)
          await checkCandleStatus(data.memorial.id)
          await fetchDigitalLife(data.memorial.id)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && !abortController.signal.aborted) {
          console.error('获取纪念页失败:', error)
          setError('获取纪念页失败，请稍后重试')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchMemorialWithCancel()
    
    return () => abortController.abort()
  }, [params.slug])

  // 用户状态变化时重新检查点蜡烛状态（但要防止重复调用）
  useEffect(() => {
    if (memorial && user !== undefined) { // 只有当用户状态确定时才检查
      checkCandleStatus(memorial.id)
    }
  }, [user?.id]) // 只监听用户ID变化，而不是整个user对象

  // 点燃蜡烛
  const handleLightCandle = async () => {
    if (!memorial) return

    try {
      const requestBody: any = {
        memorialId: memorial.id,
        message: ''
      }

      if (user) {
        requestBody.userId = user.id
        requestBody.lightedBy = user.name
      } else {
        requestBody.lightedBy = '匿名访客'
      }

      const response = await fetch(`/api/candles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          toast.warning(errorData.error || '今天已经点过蜡烛了')
          setCanLightCandle(false)
          return
        }
        throw new Error(errorData.error || '点燃蜡烛失败')
      }

      window.location.reload()
      setCanLightCandle(false)
      toast.success('思念之火已点亮')
    } catch (error: any) {
      console.error('点燃蜡烛失败:', error)
      toast.error(error.message || '点燃蜡烛失败')
    }
  }

  // 发送留言
  const handleSendMessage = async () => {
    if (!memorial || !message.trim()) return

    try {
      const requestBody: any = {
        memorialId: memorial.id,
        content: message.trim(),
      }

      if (user) {
        requestBody.userId = user.id
      } else {
        requestBody.authorName = '匿名访客'
      }

      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('发送留言失败')
      }

      setMessage('')
      window.location.reload()
      toast.success('留言已发送')
    } catch (error) {
      console.error('发送留言失败:', error)
      toast.error('发送留言失败')
    }
  }

  // 处理分享操作
  const handleShare = async (action: 'share' | 'copyLink' | 'viewQR', platform?: string) => {
    if (!memorial) return

    try {
      await fetch(`/api/memorial/${memorial.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, platform })
      })
    } catch (error) {
      console.error('记录分享统计失败:', error)
    }
  }

  // 获取主图片
  const getMainImage = () => {
    const mainImage = memorial?.images.find(img => img.isMain) || memorial?.images[0]
    return mainImage?.url || '/placeholder.svg'
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    
    try {
      let date: Date
      
      // 处理时间戳格式（毫秒）
      if (/^\d+$/.test(dateString)) {
        date = new Date(parseInt(dateString))
      } else {
        date = new Date(dateString)
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString)
        return '未知'
      }
      
      return date.toLocaleDateString('zh-CN')
    } catch (error) {
      console.error('Date formatting error:', error, dateString)
      return '未知'
    }
  }

  // 格式化年龄显示
  const formatAge = (age?: number, birthDate?: string, deathDate?: string) => {
    if (age) return `享年${age}岁`
    if (birthDate && deathDate) {
      const birth = new Date(birthDate)
      const death = new Date(deathDate)
      const years = death.getFullYear() - birth.getFullYear()
      return `享年${years}岁`
    }
    return ''
  }

  // 翻译关系
  const translateRelationship = (relationship?: string) => {
    if (!relationship) return ''
    
    const relationshipTranslations: { [key: string]: string } = {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-slate-900 mx-auto mb-4" />
          <p className="text-slate-600 font-light">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-6 font-light">{error || '纪念页不存在'}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ResponsiveNavigation currentPage="community" />

      {/* Hero Card */}
      <div className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header Section */}
            <div className="px-8 py-16">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-12">
                  {/* Person Photo */}
                  <div className="flex-shrink-0">
                    <OptimizedAvatar
                      src={getMainImage()}
                      alt={memorial.subjectName}
                      size={128}
                      fallbackText={memorial.subjectName.substring(0, 2)}
                      className="w-32 h-32 rounded-xl object-cover shadow-sm"
                    />
                  </div>
                  
                  {/* Person Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-5xl font-extralight text-slate-900 mb-6">{memorial.subjectName}</h1>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-3 lg:space-y-0 mb-8">
                      <p className="text-lg text-slate-600 font-light">
                        {translateRelationship(memorial.relationship)} • {memorial.occupation}
                      </p>
                      <p className="text-lg text-slate-600 font-light">
                        {formatAge(memorial.age, memorial.birthDate, memorial.deathDate)} • {memorial.location}
                      </p>
                    </div>
                    <p className="text-xl text-slate-700 mb-3 font-light">{formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}</p>
                    <p className="text-slate-400 font-light italic">"永远怀念，永远爱着"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-8 py-8 bg-slate-50 border-t border-slate-100">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-slate-900 mb-1">{memorial.candleCount}</div>
                    <div className="text-sm text-slate-500 font-light">点亮思念</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-slate-900 mb-1">{memorial.messageCount}</div>
                    <div className="text-sm text-slate-500 font-light">爱的寄语</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-slate-900 mb-1">{memorial.viewCount}</div>
                    <div className="text-sm text-slate-500 font-light">温暖访问</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-slate-900 mb-1">{memorial.images.length}</div>
                    <div className="text-sm text-slate-500 font-light">珍贵照片</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-8">

        {/* Content Cards Grid */}
        <div className="pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Story Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-slate-900">{memorial.subjectName}的故事</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  {memorial.story && (
                    <div className="space-y-6">
                      {memorial.story.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-slate-700 leading-relaxed font-light">
                          {paragraph}
                        </p>
                      ))}
                      {memorial.memories && (
                        <p className="text-slate-600 leading-relaxed font-light">
                          {memorial.memories}
                        </p>
                      )}
                    </div>
                  )}
                  {!memorial.story && (
                    <p className="text-slate-700 leading-relaxed font-light">
                      这里会显示生平故事...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Cards Column */}
            <div className="space-y-8">
              {/* Personality Card */}
              {memorial.personalityTraits && memorial.personalityTraits.trim() && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-light text-slate-900">性格特点</h3>
                  </div>
                  <div className="space-y-4">
                    {memorial.personalityTraits.split(',').map((trait, index) => (
                      <div key={index} className="text-slate-700 font-light">{trait.trim()}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Things Card */}
              {memorial.favoriteThings && memorial.favoriteThings.trim() && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-light text-slate-900">爱好与特长</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {memorial.favoriteThings.split(',').map((thing, index) => (
                      <span key={index} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm rounded-full font-light">
                        {thing.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-light text-slate-900">基本信息</h3>
                </div>
                <div className="space-y-4 text-sm">
                  {memorial.birthDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">出生日期</span>
                      <span className="text-slate-900 font-light">{formatDate(memorial.birthDate)}</span>
                    </div>
                  )}
                  {memorial.deathDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">离世日期</span>
                      <span className="text-slate-900 font-light">{formatDate(memorial.deathDate)}</span>
                    </div>
                  )}
                  {memorial.occupation && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">职业</span>
                      <span className="text-slate-900 font-light">{memorial.occupation}</span>
                    </div>
                  )}
                  {memorial.location && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">籍贯</span>
                      <span className="text-slate-900 font-light">{memorial.location}</span>
                    </div>
                  )}
                  {memorial.relationship && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">关系</span>
                      <span className="text-slate-900 font-light">{translateRelationship(memorial.relationship)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Card */}
        {memorial.images.length > 0 && (
          <div className="pb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10">
              <div className="mb-10">
                <h2 className="text-2xl font-light text-slate-900">珍贵时光</h2>
              </div>
              
              <MemorialImageGrid
                images={memorial.images}
                memorialName={memorial.subjectName}
                maxImages={8}
              />
            </div>
          </div>
        )}



        {/* Digital Life Card */}
        {showDigitalLife && digitalLife && (
          <div className="pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-slate-200 p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-light text-slate-900 mb-4">
                    与 {memorial.subjectName} 对话
                  </h3>
                  
                  <p className="text-slate-600 font-light mb-8 max-w-md mx-auto leading-relaxed">
                    基于珍贵记忆重现的数字生命，每一次对话都是爱的延续
                  </p>
                  
                  <button
                    onClick={handleDigitalLifeChat}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-light text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    开始对话
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-light">
                      基于真实记忆与语言风格重现 • 智能AI对话 • 情感纽带永不断线
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Card */}
        <div className="pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-2xl shadow-sm text-white p-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-light mb-6">为{memorial.subjectName}点亮思念</h3>
                <p className="text-slate-300 font-light">您的每一份思念都是对{memorial.subjectName}最好的纪念</p>
              </div>
              
              <div className="max-w-lg mx-auto space-y-8">
                <button 
                  onClick={handleLightCandle}
                  disabled={!canLightCandle}
                  className={`w-full py-4 px-8 rounded-lg font-light transition-colors ${
                    canLightCandle 
                      ? 'bg-white text-slate-900 hover:bg-slate-50' 
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canLightCandle ? '点亮思念之光' : '今日已点亮思念'}
                </button>
                
                <div className="space-y-6">
                  <Textarea
                    placeholder={`分享您与${memorial.subjectName}的美好回忆，或留下温暖的寄语...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-lg resize-none focus:outline-none focus:border-slate-600 text-white placeholder-slate-400 font-light"
                    rows={4}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-full bg-slate-700 text-white border border-slate-600 py-3 px-8 rounded-lg font-light hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    寄出爱的留言
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center gap-6 mt-8 pt-8 border-t border-slate-700">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="text-slate-300 hover:text-white transition-colors font-light flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  分享纪念
                </button>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="text-slate-300 hover:text-white transition-colors font-light flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  导出数据
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Card */}
        <div className="pb-8" id="message-section">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10">
              <div className="mb-10">
                <h2 className="text-2xl font-light text-slate-900 mb-2">爱的寄语</h2>
                <p className="text-sm text-slate-500 font-light">{memorial.messageCount} 条温暖的回忆</p>
              </div>
              
              <div className="space-y-8">
                {memorial.messages.map((msg) => (
                  <div key={msg.id} className="pl-6 py-4 border-l border-slate-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-700 text-sm font-light">
                          {(msg.user?.name || msg.authorName).substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="font-light text-slate-900">{msg.user?.name || msg.authorName}</h4>
                          <span className="text-xs text-slate-400 font-light">{formatDate(msg.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-light">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {memorial.messages.length === 0 && (
                  <div className="text-center text-slate-500 py-16">
                    <p className="font-light text-lg mb-2">还没有人为 {memorial.subjectName} 留下思念</p>
                    <p className="text-sm">成为第一个分享美好回忆的人吧</p>
                  </div>
                )}
                
                {memorial.messages.length > 3 && (
                  <div className="text-center pt-8">
                    <button className="text-slate-500 hover:text-slate-900 text-sm font-light transition-colors">
                      查看更多留言 ({memorial.messageCount - 3} 条) →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Creator Card */}
        <div className="pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-slate-700 text-xl font-light">
                  {memorial.author.name.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <h4 className="text-2xl font-extralight text-slate-900 mb-3">{memorial.author.name}</h4>
              <p className="text-slate-500 mb-8 font-light">
                {memorial.creatorRelation ? `${memorial.subjectName}的${memorial.creatorRelation}` : `${memorial.subjectName}的亲友`}
              </p>
              <div className="w-12 h-px bg-slate-200 mx-auto mb-8"></div>
              <p className="text-sm text-slate-600 leading-relaxed italic max-w-md mx-auto font-light">
                "感谢每一个人为{memorial.subjectName}留下的美好回忆和温暖寄语。{memorial.subjectName}的生命虽然短暂，但给我们留下了永恒的爱与温暖。"
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 分享弹窗 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        memorialId={memorial.id}
        memorialName={memorial.subjectName}
        memorialType={memorial.type}
        memorialSlug={memorial.slug}
        onShare={handleShare}
      />

      {/* 导出弹窗 */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        memorialId={memorial.id}
        memorialName={memorial.subjectName}
        memorialType={memorial.type}
      />
    </div>
  )
}