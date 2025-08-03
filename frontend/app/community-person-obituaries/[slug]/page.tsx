"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, MessageCircleHeart, Share2, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

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
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canLightCandle, setCanLightCandle] = useState(true)

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


  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchMemorialWithCancel = async () => {
      if (!params.slug) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/memorials/slug/${params.slug}`, {
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

  useEffect(() => {
    if (memorial) {
      checkCandleStatus(memorial.id)
    }
  }, [user])

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('链接已复制')
  }

  // 获取主图片
  const getMainImage = () => {
    const mainImage = memorial?.images.find(img => img.isMain) || memorial?.images[0]
    return mainImage?.url || '/placeholder.svg'
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  // 格式化年龄显示
  const formatAge = (age?: number, birthDate?: string, deathDate?: string) => {
    if (age) return `${age}年`
    if (birthDate && deathDate) {
      const birth = new Date(birthDate)
      const death = new Date(deathDate)
      const years = death.getFullYear() - birth.getFullYear()
      return `${years}年`
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
    <div className="min-h-screen bg-white">
      <Navigation currentPage="community" />

      {/* 极简头部 */}
      <main className="max-w-4xl mx-auto px-6 py-24 pt-32">
        <div className="text-center mb-24">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-8 overflow-hidden">
            <Image
              src={getMainImage()}
              alt={memorial.subjectName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-6xl font-extralight text-gray-900 mb-6">{memorial.subjectName}</h1>
          <div className="w-16 h-px bg-purple-400 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-light">
            {formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}
          </p>
          <p className="text-sm text-gray-500 font-light mt-2">
            {translateRelationship(memorial.relationship)} • {formatAge(memorial.age, memorial.birthDate, memorial.deathDate)} • {memorial.occupation}
          </p>
        </div>

        {/* 内容区 */}
        <div className="space-y-24">
          {/* 故事 */}
          {memorial.story && (
            <section>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-light text-gray-900 mb-12">缅怀</h2>
                <div className="prose prose-xl text-gray-700 leading-relaxed space-y-8">
                  {memorial.story.split('\n\n').map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
                  {memorial.memories && (
                    <p className="text-gray-600">
                      {memorial.memories}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 照片 */}
          {memorial.images.length > 0 && (
            <section>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-light text-gray-900">时光</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {memorial.images.slice(0, 6).map((image, index) => (
                  <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`${memorial.subjectName}的回忆`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                ))}
                {memorial.images.length > 6 && (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-light text-gray-500">+{memorial.images.length - 6}</span>
                      <p className="text-sm text-gray-500 mt-2">更多照片</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 统计 */}
          <section>
            <div className="text-center">
              <div className="flex justify-center space-x-16">
                <div>
                  <div className="text-4xl font-light text-gray-900">{memorial.candleCount}</div>
                  <div className="text-sm text-gray-500 mt-2">思念</div>
                </div>
                <div>
                  <div className="text-4xl font-light text-gray-900">{memorial.messageCount}</div>
                  <div className="text-sm text-gray-500 mt-2">寄语</div>
                </div>
                <div>
                  <div className="text-4xl font-light text-gray-900">{memorial.viewCount}</div>
                  <div className="text-sm text-gray-500 mt-2">访问</div>
                </div>
              </div>
            </div>
          </section>

          {/* 详细信息 */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-light text-gray-900">信息</h2>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              {memorial.birthDate && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-light">出生日期</span>
                  <span className="text-gray-900 font-light">{formatDate(memorial.birthDate)}</span>
                </div>
              )}
              {memorial.deathDate && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-light">离别日期</span>
                  <span className="text-gray-900 font-light">{formatDate(memorial.deathDate)}</span>
                </div>
              )}
              {memorial.occupation && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-light">职业</span>
                  <span className="text-gray-900 font-light">{memorial.occupation}</span>
                </div>
              )}
              {memorial.location && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-light">地点</span>
                  <span className="text-gray-900 font-light">{memorial.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* 操作 */}
          <section>
            <div className="text-center space-y-6">
              <button 
                onClick={handleLightCandle}
                disabled={!canLightCandle}
                className={`px-12 py-4 rounded-full font-light text-lg transition-colors ${
                  canLightCandle 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canLightCandle ? '点亮思念' : '今日已点亮'}
              </button>
              <div>
                <button 
                  onClick={() => {
                    const messageSection = document.getElementById('message-section');
                    messageSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-light"
                >
                  写下寄语
                </button>
              </div>
            </div>
          </section>

          {/* 爱的寄语 */}
          <section id="message-section">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-light text-gray-900">寄语</h2>
              <p className="text-sm text-gray-500 mt-2">{memorial.messageCount}份思念</p>
            </div>
            
            {/* 留言输入框 */}
            <div className="max-w-2xl mx-auto mb-16">
              <Textarea
                placeholder={user ? `以 ${user.name} 的身份分享一段回忆或留下爱的寄语...` : "分享一段回忆或留下爱的寄语...（将以匿名访客身份发表）"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mb-4 border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none resize-none"
                rows={4}
              />
              <div className="text-center">
                <button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-2 disabled:bg-gray-300 transition-colors font-light"
                >
                  寄出思念
                </button>
              </div>
            </div>
            
            {/* 留言列表 */}
            <div className="max-w-2xl mx-auto space-y-8">
              {memorial.messages.map((msg) => (
                <div key={msg.id} className="text-center border-b border-gray-100 pb-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600 font-light">
                      {(msg.user?.name || msg.authorName).substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-light text-gray-900 mb-2">{msg.user?.name || msg.authorName}</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {msg.content}
                  </p>
                  <time className="text-sm text-gray-500 font-light">{formatDate(msg.createdAt)}</time>
                </div>
              ))}
              {memorial.messages.length === 0 && (
                <div className="text-center text-gray-500 py-16">
                  <p className="font-light text-lg mb-2">还没有人为 {memorial.subjectName} 留下思念</p>
                  <p className="text-sm">成为第一个分享美好回忆的人吧</p>
                </div>
              )}
            </div>
          </section>

          {/* 创建者信息 */}
          <section>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {memorial.author.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <h4 className="font-light text-gray-900 mb-2">{memorial.author.name}</h4>
              <p className="text-sm text-gray-500 font-light">
                {memorial.creatorRelation ? `${memorial.subjectName}的${memorial.creatorRelation}` : `${memorial.subjectName}的亲友`}
              </p>
              <div className="mt-6 max-w-md mx-auto">
                <p className="text-sm text-gray-600 font-light italic">
                  "感谢您为{memorial.subjectName}创建了这个美好的纪念"
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}