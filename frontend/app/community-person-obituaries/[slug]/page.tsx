"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, MessageCircleHeart, Share2, User, Loader2, Download, Volume2, Play, Pause, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { ShareModal } from "@/components/ui/share-modal"
import { ExportModal } from "@/components/ui/export-modal"
import { OptimizedAvatar, MemorialImageGrid } from "@/components/ui/optimized-image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface VoiceModel {
  id: string
  name: string
  description?: string
  status: 'TRAINING' | 'READY' | 'FAILED' | 'INACTIVE'
  quality?: number
  usageCount: number
  creator: {
    name: string
  }
}

export default function PersonMemorialPage() {
  const params = useParams()
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canLightCandle, setCanLightCandle] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  // 语音合成相关状态
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([])
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<string>('')
  const [synthesisText, setSynthesisText] = useState('')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [synthesizedAudio, setSynthesizedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVoiceSynthesis, setShowVoiceSynthesis] = useState(false)

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

  // 获取纪念页面的语音模型
  const fetchVoiceModels = async (memorialId: string) => {
    try {
      const response = await fetch(`/api/voice-models?memorialId=${memorialId}&publicOnly=true`)
      if (response.ok) {
        const data = await response.json()
        setVoiceModels(data.voiceModels)
        
        // 如果有可用的语音模型，显示语音合成功能
        if (data.voiceModels.length > 0) {
          setShowVoiceSynthesis(true)
          // 默认选择第一个模型
          setSelectedVoiceModel(data.voiceModels[0].id)
        }
      }
    } catch (error) {
      console.error('获取语音模型失败:', error)
    }
  }

  // 执行语音合成
  const handleVoiceSynthesis = async () => {
    if (!synthesisText.trim()) {
      toast.error('请输入要合成的文字')
      return
    }
    
    if (!selectedVoiceModel) {
      toast.error('请选择语音模型')
      return
    }
    
    setIsSynthesizing(true)
    
    try {
      const response = await fetch('/api/voice-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: synthesisText.trim(),
          voiceModelId: selectedVoiceModel
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '语音合成失败')
      }
      
      const result = await response.json()
      
      if (result.success && result.audioUrl) {
        setSynthesizedAudio(result.audioUrl)
        toast.success('语音合成成功！')
      } else {
        throw new Error('语音合成返回了无效的结果')
      }
      
    } catch (error: any) {
      console.error('语音合成失败:', error)
      toast.error(error.message || '语音合成失败，请稍后重试')
    } finally {
      setIsSynthesizing(false)
    }
  }

  // 播放/暂停合成的音频
  const toggleAudio = () => {
    if (!synthesizedAudio) return
    
    const audio = new Audio(synthesizedAudio)
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
      
      audio.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  // 下载合成的音频
  const downloadAudio = () => {
    if (!synthesizedAudio) return
    
    const link = document.createElement('a')
    link.href = synthesizedAudio
    link.download = `${memorial?.subjectName}_语音合成_${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          await fetchVoiceModels(data.memorial.id)
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
    <div className="min-h-screen bg-white">
      <Navigation currentPage="community" />

      {/* 极简头部 */}
      <main className="max-w-4xl mx-auto px-6 py-24 pt-32">
        <div className="text-center mb-24">
          <div className="mx-auto mb-8">
            <OptimizedAvatar
              src={getMainImage()}
              alt={memorial.subjectName}
              size={96}
              fallbackText={memorial.subjectName.substring(0, 2)}
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
              <MemorialImageGrid
                images={memorial.images}
                memorialName={memorial.subjectName}
                maxImages={6}
              />
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
                  <span className="text-gray-500 font-light">祖籍</span>
                  <span className="text-gray-900 font-light">{memorial.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* 语音合成功能 */}
          {showVoiceSynthesis && voiceModels.length > 0 && (
            <section>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-light text-gray-900">用TA的声音说话</h2>
                <p className="text-sm text-gray-500 mt-2">使用AI重现的声音表达想说的话</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Volume2 className="w-5 h-5 text-purple-600" />
                      语音合成
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 语音模型选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择语音模型
                      </label>
                      <Select value={selectedVoiceModel} onValueChange={setSelectedVoiceModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语音模型" />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{model.name}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {model.quality && (
                                    <span>质量: {Math.round(model.quality * 100)}%</span>
                                  )}
                                  <span>by {model.creator.name}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 文本输入 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        输入要合成的文字
                      </label>
                      <Textarea
                        value={synthesisText}
                        onChange={(e) => setSynthesisText(e.target.value)}
                        placeholder={`用${memorial.subjectName}的声音说一句话...`}
                        className="min-h-24 resize-none"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {synthesisText.length}/200
                      </div>
                    </div>

                    {/* 合成按钮 */}
                    <div className="text-center">
                      <Button
                        onClick={handleVoiceSynthesis}
                        disabled={isSynthesizing || !synthesisText.trim() || !selectedVoiceModel}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSynthesizing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            合成中...
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            生成语音
                          </>
                        )}
                      </Button>
                    </div>

                    {/* 合成结果 */}
                    {synthesizedAudio && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleAudio}
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="w-4 h-4 mr-1" />
                                  暂停
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  播放
                                </>
                              )}
                            </Button>
                            <span className="text-sm text-gray-600">
                              "{synthesisText}"
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadAudio}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• 此功能使用AI技术重现逝者声音，仅供纪念使用</p>
                      <p>• 语音模型由纪念页创建者提供并授权公开使用</p>
                      <p>• 请合理使用，表达对逝者的敬意和怀念</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

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
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => {
                    const messageSection = document.getElementById('message-section');
                    messageSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-light"
                >
                  写下寄语
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-light flex items-center gap-1"
                >
                  <Share2 className="w-4 h-4" />
                  分享纪念
                </button>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-light flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  导出数据
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