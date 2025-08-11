"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Sparkles, Heart, Wand2, Palette, Camera, Star, Lightbulb, MessageCircle, Trash2, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Memorial {
  id: string
  title: string
  subjectName: string
  type: 'PET'
  slug: string
  images: Array<{
    url: string
    thumbnailUrl: string | null
    isMain: boolean
  }>
}

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

interface ImageGeneration {
  id: string
  taskId: string
  title: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  sourceImageUrl: string
  resultImageUrl?: string
  sceneType: string
  createdAt: string
  memorial?: {
    id: string
    subjectName: string
    title: string
  }
}

export default function PetDigitalLifePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [petDigitalLives, setPetDigitalLives] = useState<DigitalLife[]>([])
  const [imageGenerations, setImageGenerations] = useState<ImageGeneration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // 并行获取所有数据
      const [memorialsResponse, digitalLivesResponse, generationsResponse] = await Promise.all([
        fetch('/api/memorials/user', { credentials: 'include' }),
        fetch('/api/digital-lives', { credentials: 'include' }),
        fetch('/api/image-generation', { credentials: 'include' })
      ])
      
      let petMemorials: Memorial[] = []
      if (memorialsResponse.ok) {
        const memorialsData = await memorialsResponse.json()
        petMemorials = memorialsData.memorials.filter((m: Memorial) => m.type === 'PET')
        setMemorials(petMemorials)
      }

      // 获取数字生命并过滤宠物类型的
      if (digitalLivesResponse.ok) {
        const digitalLivesData = await digitalLivesResponse.json()
        const petMemorialIds = petMemorials.map(m => m.id)
        const petDigitalLives = digitalLivesData.digitalLives
          .filter((dl: DigitalLife) => petMemorialIds.includes(dl.memorial.id))
        setPetDigitalLives(petDigitalLives)
      }

      if (generationsResponse.ok) {
        const generationsData = await generationsResponse.json()
        setImageGenerations(generationsData.data || [])
      }
      
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
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

  // 删除数字生命
  const deleteDigitalLife = async (digitalLife: DigitalLife) => {
    if (!confirm(`确定要删除数字生命"${digitalLife.name}"吗？此操作不可撤销，将同时删除所有相关的音频样本、聊天记录和对话历史。`)) {
      return
    }

    try {
      const response = await fetch(`/api/digital-lives/${digitalLife.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除失败')
      }

      toast.success(`数字生命"${digitalLife.name}"已删除`)
      // 重新获取数据
      fetchData()
      
    } catch (error: any) {
      console.error('删除数字生命失败:', error)
      toast.error(error.message || '删除失败，请稍后重试')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center px-5">
        <div className="text-4xl mb-8 opacity-80">🐾</div>
        <h1 className="text-3xl font-light mb-6 text-gray-900 tracking-tight">宠物数字生命</h1>
        <p className="text-lg text-gray-600 font-light mb-12 max-w-md">
          请先登录以访问您的宠物数字生命
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
      <ResponsiveNavigation currentPage="pet-memorial" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* 主要部分 */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center py-20 pt-20 lg:pt-32">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-8 sm:mb-12 text-teal-400">
            <Heart className="w-full h-full" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-6 sm:mb-8 text-gray-900 tracking-tight leading-none">
            宠物数字生命
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 mb-4 sm:mb-6 font-extralight max-w-2xl leading-relaxed px-4">
            当小天使回到天堂，当思念无处安放
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 font-light max-w-3xl leading-relaxed px-4">
            通过AI技术为您心爱的宠物生成温馨美好的天堂场景图片<br className="hidden sm:block"/>
            <span className="sm:hidden"> </span>让每一份思念都化作永恒的纪念，让爱延续在美好的画面中
          </p>
          
          {/* 特色说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mb-12 sm:mb-16 text-center px-4">
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-teal-50/50 rounded-lg border border-teal-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-teal-500">
                <Camera className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">AI图片生成</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                基于宠物照片，生成在天堂花园等温馨场景中的图片
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-teal-50/50 rounded-lg border border-teal-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-teal-500">
                <Palette className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">多种场景</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                天堂花园、云端仙境、童话森林等多种温馨场景选择
              </p>
            </div>
            <div className="px-4 sm:px-6 py-6 sm:py-8 bg-teal-50/50 rounded-lg border border-teal-100/50">
              <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-teal-500">
                <Heart className="w-full h-full" />
              </div>
              <h3 className="text-base sm:text-lg font-light text-gray-800 mb-2 sm:mb-3">温馨纪念</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                为小天使创造美好的天堂生活场景，慰藉思念之情
              </p>
            </div>
          </div>
          
          <Link 
            href="/pet-digital-life/image-generation"
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base font-light tracking-wide sm:tracking-widest hover:from-teal-700 hover:to-teal-800 transition-all duration-500 hover:tracking-wide inline-block border-0 hover:shadow-lg"
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            开始生成图片
          </Link>
          
          <p className="text-xs sm:text-sm text-gray-400 mt-6 sm:mt-8 font-light">
            通常需要 1-3 分钟完成生成 · 完全免费
          </p>
        </section>
        
        {/* 我的宠物纪念页面部分 */}
        {!isLoading && (
          <section className="pb-20 sm:pb-32">
            <div className="text-center mb-12 sm:mb-20 px-4">
              <h2 className="text-2xl sm:text-3xl font-extralight mb-3 sm:mb-4 text-gray-900 tracking-wide">
                我的宠物纪念
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                这里珍藏着与小天使们的美好回忆，每一个都承载着无法磨灭的爱与思念
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto px-4">
              {memorials.length === 0 ? (
                <div className="text-center py-16 sm:py-24 border-t border-gray-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-8 text-gray-300">
                    <Heart className="w-full h-full" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-light text-gray-700 mb-2 sm:mb-3">还没有宠物纪念页面</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 font-light max-w-lg mx-auto leading-relaxed">
                    为您心爱的小天使创建纪念页面，上传照片后就可以生成温馨的天堂场景图片了。<br className="hidden sm:block"/>
                    <span className="sm:hidden"> </span>让爱的记忆在美好的画面中永远延续。
                  </p>
                  <div className="mb-8 sm:mb-12 px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-lg border border-teal-100 max-w-md mx-auto">
                    <div className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" /> <strong>温馨提示:</strong> 创建宠物纪念页面需要上传小天使的照片，这样AI就能为TA生成在天堂中快乐生活的温馨场景图片。
                    </div>
                  </div>
                  <Link 
                    href="/create-obituary"
                    className="bg-transparent text-teal-600 border border-teal-200 px-6 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm font-light tracking-wide hover:border-teal-400 hover:text-teal-700 transition-all duration-300 inline-block"
                  >
                    创建宠物纪念
                  </Link>
                </div>
              ) : (
                <>
                  {memorials.map((memorial) => (
                    <div 
                      key={memorial.id}
                      className="flex justify-between items-center py-6 border-b border-gray-100 transition-all duration-200 hover:bg-teal-50/30 hover:-mx-5 hover:px-5 last:border-b-0"
                    >
                      <div className="flex items-center gap-4">
                        {/* 头像 */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-100 flex-shrink-0">
                          {memorial.images && memorial.images.length > 0 ? (
                            <img 
                              src={memorial.images.find(img => img.isMain)?.thumbnailUrl || 
                                   memorial.images.find(img => img.isMain)?.url ||
                                   memorial.images[0].thumbnailUrl || 
                                   memorial.images[0].url}
                              alt={memorial.subjectName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-teal-400">
                              <Heart className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-lg font-normal text-gray-900">
                            {memorial.subjectName}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {memorial.title}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => router.push(`/pet-digital-life/image-generation?memorialId=${memorial.id}`)}
                          className="text-sm text-teal-600 hover:text-teal-800 transition-colors duration-200 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          生成图片
                        </button>
                        <Link 
                          href={`/community-pet-obituaries/${memorial.slug}`}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                        >
                          查看纪念
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center items-center py-10 mt-8">
                    <Link 
                      href="/create-obituary"
                      className="bg-transparent text-gray-400 border border-gray-300 px-8 py-4 text-sm tracking-wide hover:border-teal-500 hover:text-teal-600 transition-all duration-200 inline-block"
                    >
                      + 创建新的宠物纪念
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 我的宠物数字生命部分 */}
        {!isLoading && petDigitalLives.length > 0 && (
          <section className="pb-20 sm:pb-32">
            <div className="text-center mb-12 sm:mb-20 px-4">
              <h2 className="text-2xl sm:text-3xl font-extralight mb-3 sm:mb-4 text-gray-900 tracking-wide">
                我的宠物数字生命
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                与小天使们的数字化身进行对话，让思念有了温暖的回应
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto px-4">
              {petDigitalLives.map((digitalLife) => (
                <div 
                  key={digitalLife.id}
                  className="flex justify-between items-center py-6 border-b border-gray-100 transition-all duration-200 hover:bg-teal-50/30 hover:-mx-5 hover:px-5 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    {/* 头像 */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-100 flex-shrink-0">
                      {digitalLife.memorial.images.length > 0 ? (
                        <img 
                          src={digitalLife.memorial.images[0].thumbnailUrl || digitalLife.memorial.images[0].url}
                          alt={digitalLife.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-400">
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
                  
                  <div className="flex items-center gap-2">
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
                        className="text-sm text-teal-600 hover:text-teal-800 transition-colors duration-200 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        对话
                      </button>
                    )}
                    
                    {/* 管理按钮 */}
                    <button 
                      onClick={() => router.push(`/digital-life/edit/${digitalLife.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg flex items-center gap-1"
                      title="编辑音频和聊天记录"
                    >
                      <Edit3 className="w-3 h-3" />
                      编辑
                    </button>
                    
                    <button 
                      onClick={() => deleteDigitalLife(digitalLife)}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg flex items-center gap-1"
                      title="删除数字生命"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 我的生成记录部分 */}
        {!isLoading && imageGenerations.length > 0 && (
          <section className="pb-20 sm:pb-32">
            <div className="text-center mb-12 sm:mb-20 px-4">
              <h2 className="text-2xl sm:text-3xl font-extralight mb-3 sm:mb-4 text-gray-900 tracking-wide">
                生成记录
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                您为小天使们生成的所有温馨场景图片
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageGenerations.slice(0, 6).map((generation) => (
                  <div 
                    key={generation.id}
                    className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square relative bg-gray-100">
                      {generation.resultImageUrl ? (
                        <img 
                          src={generation.resultImageUrl}
                          alt={generation.title}
                          className="w-full h-full object-cover"
                        />
                      ) : generation.sourceImageUrl ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={generation.sourceImageUrl}
                            alt="Source"
                            className="w-full h-full object-cover opacity-50"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {generation.status === 'PROCESSING' && (
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                                <p className="text-xs text-gray-600">{generation.progress}%</p>
                              </div>
                            )}
                            {generation.status === 'FAILED' && (
                              <div className="text-center text-red-500">
                                <Star className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">生成失败</p>
                              </div>
                            )}
                            {generation.status === 'PENDING' && (
                              <div className="text-center text-teal-500">
                                <Sparkles className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">等待处理</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-gray-400">
                          <Heart className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{generation.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {generation.memorial?.subjectName || '未知宠物'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(generation.createdAt)}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          generation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          generation.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                          generation.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {generation.status === 'COMPLETED' ? '已完成' :
                           generation.status === 'PROCESSING' ? '生成中' :
                           generation.status === 'FAILED' ? '失败' : '等待中'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {imageGenerations.length > 6 && (
                <div className="text-center mt-8">
                  <Link 
                    href="/pet-digital-life/generations"
                    className="text-teal-600 hover:text-teal-700 text-sm font-light"
                  >
                    查看全部生成记录 ({imageGenerations.length})
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      
      <Footer />
    </div>
  )
}