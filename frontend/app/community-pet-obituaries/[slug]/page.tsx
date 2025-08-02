"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, Download, Copy, Mail, MessageCircleHeart, Share2, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { calculateMemorialStatus, getStatusColorClass, getActivityDescription } from "@/lib/memorial-status"

interface Memorial {
  id: string
  title: string
  slug: string
  type: 'PET' | 'HUMAN'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
  subjectName: string
  subjectType?: string
  birthDate?: string
  deathDate?: string
  age?: string
  breed?: string
  color?: string
  gender?: string
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

export default function PetMemorialPage() {
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
      // 出错时默认允许点蜡烛
      setCanLightCandle(true)
    }
  }

  // 获取纪念页数据
  const fetchMemorial = async () => {
    if (!params.slug) return

    try {
      setLoading(true)
      setError(null)

      // 首先通过slug查找纪念页
      const response = await fetch(`/api/memorials/slug/${params.slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('纪念页不存在')
        } else {
          throw new Error('获取纪念页失败')
        }
        return
      }

      const data = await response.json()
      
      if (data.memorial.type !== 'PET') {
        setError('这不是一个宠物纪念页')
        return
      }

      setMemorial(data.memorial)
      
      // 获取纪念页后检查点蜡烛状态
      await checkCandleStatus(data.memorial.id)
    } catch (error) {
      console.error('获取纪念页失败:', error)
      setError('获取纪念页失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemorial()
  }, [params.slug])

  // 用户状态变化时重新检查点蜡烛状态
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

      // 如果用户已登录，使用用户信息；否则使用匿名
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
        // 对于429状态码（限制错误），显示警告而不是错误
        if (response.status === 429) {
          toast.warning(errorData.error || '今天已经点过蜡烛了')
          setCanLightCandle(false)
          return
        }
        throw new Error(errorData.error || '点燃蜡烛失败')
      }

      // 重新获取数据以更新蜡烛数量
      fetchMemorial()
      // 成功点蜡烛后，设置为今日不可再点
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

      // 如果用户已登录，使用用户ID；否则使用匿名访客名称
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
      fetchMemorial()
      toast.success('留言已发送')
    } catch (error) {
      console.error('发送留言失败:', error)
      toast.error('发送留言失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
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

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, "_blank")
  }

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=纪念 ${memorial.subjectName}&url=${window.location.href}`,
      "_blank",
    )
  }

  const handleSharePinterest = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${window.location.href}&description=纪念 ${memorial.subjectName}`,
      "_blank",
    )
  }

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=纪念 ${memorial.subjectName}&body=我想与您分享这个美丽的纪念页面: ${window.location.href}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('链接已复制')
  }

  // 获取主图片
  const getMainImage = () => {
    const mainImage = memorial.images.find(img => img.isMain) || memorial.images[0]
    return mainImage?.url || '/placeholder.svg'
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  // 翻译品种名称
  const translateBreed = (breed?: string) => {
    if (!breed) return '未知'
    
    const breedTranslations: { [key: string]: string } = {
      // 狗类品种
      'labrador': '拉布拉多',
      'golden-retriever': '金毛寻回犬',
      'german-shepherd': '德国牧羊犬',
      'bulldog': '斗牛犬',
      'poodle': '贵宾犬',
      'husky': '哈士奇',
      'chihuahua': '吉娃娃',
      'shiba-inu': '柴犬',
      'corgi': '柯基',
      'beagle': '比格犬',
      'border-collie': '边境牧羊犬',
      'rottweiler': '罗威纳',
      'yorkshire-terrier': '约克夏梗',
      'dachshund': '腊肠犬',
      'boxer': '拳师犬',
      'australian-shepherd': '澳洲牧羊犬',
      'siberian-husky': '西伯利亚雪橇犬',
      'great-dane': '大丹犬',
      'pomeranian': '博美',
      'shih-tzu': '西施犬',
      'boston-terrier': '波士顿梗',
      'bernese-mountain-dog': '伯恩山犬',
      'french-bulldog': '法国斗牛犬',
      'cocker-spaniel': '可卡犬',
      'maltese': '马尔济斯',
      'mixed-breed-dog': '混种犬',
      'other-dog': '其他犬种',
      
      // 猫类品种
      'persian': '波斯猫',
      'maine-coon': '缅因猫',
      'siamese': '暹罗猫',
      'ragdoll': '布偶猫',
      'british-shorthair': '英国短毛猫',
      'american-shorthair': '美国短毛猫',
      'scottish-fold': '苏格兰折耳猫',
      'russian-blue': '俄罗斯蓝猫',
      'bengal': '孟加拉猫',
      'abyssinian': '阿比西尼亚猫',
      'birman': '伯曼猫',
      'exotic-shorthair': '异国短毛猫',
      'norwegian-forest': '挪威森林猫',
      'sphynx': '斯芬克斯猫',
      'oriental-shorthair': '东方短毛猫',
      'devon-rex': '德文卷毛猫',
      'turkish-angora': '土耳其安哥拉猫',
      'munchkin': '曼基康猫',
      'domestic-shorthair': '家养短毛猫',
      'domestic-longhair': '家养长毛猫',
      'mixed-breed-cat': '混种猫',
      'other-cat': '其他猫种',
      
      // 鸟类品种
      'canary': '金丝雀',
      'budgerigar': '虎皮鹦鹉',
      'cockatiel': '玄凤鹦鹉',
      'lovebird': '爱情鸟',
      'macaw': '金刚鹦鹉',
      'african-grey': '非洲灰鹦鹉',
      'cockatoo': '凤头鹦鹉',
      'conure': '锥尾鹦鹉',
      'finch': '雀',
      'parakeet': '长尾小鹦鹉',
      'other-bird': '其他鸟类'
    }
    
    return breedTranslations[breed] || breed
  }

  // 翻译颜色
  const translateColor = (color?: string) => {
    if (!color) return '未知'
    
    const colorTranslations: { [key: string]: string } = {
      'black': '黑色',
      'white': '白色',
      'brown': '棕色',
      'gray': '灰色',
      'black-white': '黑白色',
      'brown-white': '棕白色',
      'multicolor': '多色'
    }
    
    return colorTranslations[color] || color
  }

  // 翻译宠物类型
  const translatePetType = (type?: string) => {
    if (!type) return '宠物'
    
    const typeTranslations: { [key: string]: string } = {
      'dog': '狗',
      'cat': '猫',
      'bird': '鸟',
      'rabbit': '兔子',
      'hamster': '仓鼠',
      'guinea-pig': '豚鼠',
      'other': '其他'
    }
    
    return typeTranslations[type] || type
  }

  // 计算年龄（如果数据库中没有年龄信息）
  const calculateAge = (birthDate?: string, deathDate?: string) => {
    if (!birthDate || !deathDate) return '未知'
    
    const birth = new Date(birthDate)
    const death = new Date(deathDate)
    
    if (death < birth) return '日期无效'
    
    const diffTime = death.getTime() - birth.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays}天`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      const remainingDays = diffDays % 30
      return remainingDays > 0 ? `${months}个月${remainingDays}天` : `${months}个月`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingDays = diffDays % 365
      const months = Math.floor(remainingDays / 30)
      
      if (months > 0) {
        return `${years}岁${months}个月`
      } else {
        return `${years}岁`
      }
    }
  }

  // 获取显示的年龄
  const getDisplayAge = () => {
    // 如果数据库中有年龄信息，优先使用
    if (memorial?.age && memorial.age !== '未知') {
      return memorial.age
    }
    // 否则根据出生和去世日期计算
    return calculateAge(memorial?.birthDate, memorial?.deathDate)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        /* 信息层级系统 */
        .info-primary { font-size: 1.125rem; font-weight: 400; }
        .info-secondary { font-size: 0.9rem; font-weight: 300; }
        .info-tertiary { font-size: 0.8rem; font-weight: 300; }
        
        /* 渐进式披露 */
        .progressive-disclosure {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .expandable-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .expandable-content.expanded {
          max-height: 1000px;
        }
        
        /* 微妙交互 */
        .subtle-hover {
          transition: all 0.2s ease;
        }
        
        .subtle-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        /* 阅读优化 */
        .reading-width {
          max-width: 65ch;
        }
        
        /* 信息卡片系统 */
        .info-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(20px);
        }
        
        /* 状态指示器 */
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        
        /* 快速操作按钮 */
        .quick-action {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 50;
        }
        
        /* 响应式信息网格 */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navigation currentPage="community" />

      {/* 主要信息区域 */}
      <main className="max-w-6xl mx-auto px-4 py-8 pt-32">
        {/* 核心信息卡片 */}
        <section className="info-card rounded-xl p-8 mb-8 subtle-hover">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* 头像区域 */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl mx-auto mb-4 overflow-hidden">
                <Image
                  src={getMainImage()}
                  alt={memorial.subjectName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`status-indicator ${getStatusColorClass(calculateMemorialStatus(memorial).color)} mr-2`}></div>
              <span className="info-tertiary text-gray-500">{calculateMemorialStatus(memorial).description}</span>
            </div>
            
            {/* 基本信息 */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-light text-gray-900 mb-4">{memorial.subjectName}</h1>
              
              <div className="info-grid mb-6">
                <div>
                  <div className="info-tertiary text-gray-500 mb-1">品种</div>
                  <div className="info-secondary text-gray-800">{translateBreed(memorial.breed)}</div>
                </div>
                <div>
                  <div className="info-tertiary text-gray-500 mb-1">性别</div>
                  <div className="info-secondary text-gray-800">{memorial.gender === 'male' ? '男孩' : memorial.gender === 'female' ? '女孩' : '未知'}</div>
                </div>
                <div>
                  <div className="info-tertiary text-gray-500 mb-1">陪伴时间</div>
                  <div className="info-secondary text-gray-800">{getDisplayAge()}</div>
                </div>
                <div>
                  <div className="info-tertiary text-gray-500 mb-1">纪念状态</div>
                  <div className="info-secondary text-gray-800 flex items-center">
                    <div className={`status-indicator ${getStatusColorClass(calculateMemorialStatus(memorial).color)} mr-2`}></div>
                    {calculateMemorialStatus(memorial).label}
                  </div>
                </div>
              </div>
              
              {/* 关键统计 */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">{memorial.candleCount}</div>
                  <div className="info-tertiary text-gray-500">蜡烛</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">{memorial.messageCount}</div>
                  <div className="info-tertiary text-gray-500">留言</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900">{memorial.viewCount}</div>
                  <div className="info-tertiary text-gray-500">访问</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 详细信息区域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-8">

            {/* 生平概要 */}
            <section className="info-card rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-gray-900">生平概要</h2>
                <button className="info-tertiary text-cyan-600 hover:text-cyan-700 transition-colors" onClick={() => {
                  const element = document.getElementById('bio-details');
                  element?.classList.toggle('expanded');
                }}>
                  展开详情
                </button>
              </div>
              
              <div className="reading-width space-y-4">
                {memorial.story && (
                  <p className="info-primary text-gray-700">
                    {memorial.story.split('\n\n')[0]}
                  </p>
                )}
                
                <div id="bio-details" className="expandable-content">
                  {memorial.story && memorial.story.split('\n\n').slice(1).map((paragraph, index) => (
                    <p key={index} className="info-secondary text-gray-600 mb-4">
                      {paragraph}
                    </p>
                  ))}
                  {memorial.memories && (
                    <p className="info-secondary text-gray-600 mb-4">
                      {memorial.memories}
                    </p>
                  )}
                </div>
              </div>
            </section>

            
            {/* 照片集锦 */}
            {memorial.images.length > 0 && (
              <section className="info-card rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-gray-900">照片集锦</h2>
                  <div className="flex items-center space-x-2">
                    <span className="info-tertiary text-gray-500">{memorial.images.length}张照片</span>
                    <button className="info-tertiary text-cyan-600 hover:text-cyan-700 transition-colors">
                      查看全部
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {memorial.images.slice(0, 4).map((image, index) => (
                    <div key={image.id} className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl overflow-hidden subtle-hover cursor-pointer">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`${memorial.subjectName}的回忆`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* 侧边信息栏 */}
          <div className="space-y-6">
            {/* 表达思念 */}
            <section className="info-card rounded-xl p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">表达思念</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLightCandle}
                  disabled={!canLightCandle}
                  className={`w-full py-3 rounded-xl info-secondary transition-colors flex items-center justify-center space-x-2 ${
                    canLightCandle 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>{canLightCandle ? '点亮思念之火' : '今日已点亮'}</span>
                </button>
                <button 
                  onClick={() => {
                    const messageSection = document.getElementById('message-section');
                    messageSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 py-3 rounded-xl info-secondary transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>写下思念</span>
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-full border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 py-3 rounded-xl info-secondary transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>传递爱与美好</span>
                </button>
              </div>
            </section>
            
            {/* 详细属性 */}
            <section className="info-card rounded-xl p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">详细信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="info-tertiary text-gray-500">出生日期</span>
                  <span className="info-secondary text-gray-800">{formatDate(memorial.birthDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="info-tertiary text-gray-500">离别日期</span>
                  <span className="info-secondary text-gray-800">{formatDate(memorial.deathDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="info-tertiary text-gray-500">毛色</span>
                  <span className="info-secondary text-gray-800">{translateColor(memorial.color)}</span>
                </div>
                {memorial.personalityTraits && (
                  <div className="flex justify-between items-center">
                    <span className="info-tertiary text-gray-500">性格</span>
                    <span className="info-secondary text-gray-800">{memorial.personalityTraits.substring(0, 10)}...</span>
                  </div>
                )}
                {memorial.favoriteThings && (
                  <div className="flex justify-between items-center">
                    <span className="info-tertiary text-gray-500">最爱</span>
                    <span className="info-secondary text-gray-800">{memorial.favoriteThings.substring(0, 10)}...</span>
                  </div>
                )}
              </div>
            </section>
            
            {/* 创建者信息 */}
            <section className="info-card rounded-xl p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                创建者
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {memorial.author.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="info-secondary text-gray-800 font-medium">{memorial.author.name}</div>
                  <div className="info-tertiary text-gray-500">
                    {memorial.creatorRelation ? `${memorial.subjectName}的${memorial.creatorRelation}` : `${memorial.subjectName}的守护者`}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="info-tertiary text-gray-500 text-center">
                  "感谢您为{memorial.subjectName}创建了这个美好的纪念"
                </div>
              </div>
            </section>
          </div>
        </div>
        
        {/* 爱的寄语 */}
        <section id="message-section" className="mt-12 info-card rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-gray-600" />
              爱的寄语
            </h2>
            <div className="flex items-center space-x-2">
              <span className="info-tertiary text-gray-500">{memorial.messageCount}份思念</span>
              <button className="info-tertiary text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1">
                <MessageCircleHeart className="w-4 h-4" />
                寄语思念
              </button>
            </div>
          </div>
          
          {/* 留言输入框 */}
          <div className="mb-6">
            <Textarea
              placeholder={user ? `以 ${user.name} 的身份分享一段回忆或留下爱的寄语...` : "分享一段回忆或留下爱的寄语...（将以匿名访客身份发表）"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-4 border-gray-300 rounded-2xl focus:border-gray-400 focus:outline-none"
              rows={4}
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-8 py-2 disabled:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                寄出思念
              </button>
            </div>
          </div>
          
          {/* 留言列表 */}
          <div className="space-y-6">
            {memorial.messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 subtle-hover">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="info-tertiary">{(msg.user?.name || msg.authorName).substring(0, 1).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="info-secondary text-gray-800">{msg.user?.name || msg.authorName}</span>
                    <div className="status-indicator bg-green-400"></div>
                    <time className="info-tertiary text-gray-500">{formatDate(msg.createdAt)}</time>
                  </div>
                  <p className="info-secondary text-gray-600 reading-width">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {memorial.messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <MessageCircleHeart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-light text-lg mb-2">还没有人为 {memorial.subjectName} 留下思念</p>
                <p className="text-sm">成为第一个分享美好回忆的人吧</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 快速思念悬浮按钮 */}
      <div className="quick-action">
        <button 
          onClick={handleLightCandle}
          disabled={!canLightCandle}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            canLightCandle 
              ? 'bg-gray-900 hover:bg-gray-800 text-white hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={canLightCandle ? "点亮思念之火" : "今日已点亮"}
        >
          <Flame className="w-5 h-5" />
        </button>
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}
