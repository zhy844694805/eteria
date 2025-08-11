"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, User, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { MemorialDetailSkeleton, ErrorState } from "@/components/loading-skeletons"
import { ShareModal } from "@/components/ui/share-modal"
import { ExportModal } from "@/components/ui/export-modal"
import { OptimizedAvatar, MemorialImageGrid } from "@/components/ui/optimized-image"

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

export default function PetMemorialPage() {
  const params = useParams()
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canLightCandle, setCanLightCandle] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

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
        
        if (data.memorial.type !== 'PET') {
          setError('这不是一个宠物纪念页')
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
      window.location.reload()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
        <ResponsiveNavigation currentPage="community" />
        <MemorialDetailSkeleton />
        <Footer />
      </div>
    )
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
        <ResponsiveNavigation currentPage="community" />
        <div className="pt-32">
          <ErrorState 
            title={error ? "加载失败" : "纪念页不存在"}
            description={error || "您访问的纪念页可能已被删除或不存在"}
            onRetry={error ? () => window.location.reload() : undefined}
          />
        </div>
        <Footer />
      </div>
    )
  }


  // 获取主图片
  const getMainImage = () => {
    const mainImage = memorial.images.find(img => img.isMain) || memorial.images[0]
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
      'golden': '金色',
      'yellow': '黄色',
      'orange': '橙色',
      'red': '红色',
      'cream': '奶油色',
      'tan': '棕褐色',
      'silver': '银色',
      'blue': '蓝色',
      'chocolate': '巧克力色',
      'caramel': '焦糖色',
      'black-white': '黑白相间',
      'brown-white': '棕白相间',
      'gray-white': '灰白相间',
      'tabby': '虎斑色',
      'tricolor': '三色',
      'multicolor': '多种颜色'
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

  // 翻译性格特征（支持新旧格式）
  const translatePersonalityTraits = (traits?: string) => {
    if (!traits) return ''
    
    const personalityTranslations: { [key: string]: string } = {
      // 旧格式（英文）
      'Playful': '顽皮活泼',
      'Loyal': '忠诚可靠',
      'Gentle': '温柔安静',
      'Energetic': '精力充沛',
      'Calm': '冷静沉着',
      'Friendly': '友好亲人',
      'Aggressive': '好斗',
      'Shy': '害羞',
      'Curious': '好奇',
      'Protective': '保护性强',
      'Independent': '独立',
      'Affectionate': '亲切'
      // 新格式已经是中文，不需要翻译
    }
    
    // 处理逗号分隔的多个特征
    return traits.split(',').map(trait => {
      const trimmedTrait = trait.trim()
      return personalityTranslations[trimmedTrait] || trimmedTrait
    }).join('、')
  }

  // 翻译喜欢的活动（支持新旧格式）
  const translateFavoriteActivities = (activities?: string) => {
    if (!activities) return ''
    
    const activityTranslations: { [key: string]: string } = {
      // 旧格式（英文key）- 保持向后兼容
      'walking': '散步',
      'playing-fetch': '捡球游戏',
      'swimming': '游泳',
      'running': '跑步',
      'sleeping': '睡觉',
      'eating-treats': '吃零食',
      'playing-with-toys': '玩玩具',
      'greeting-visitors': '迎接客人',
      'car-rides': '坐车兜风',
      'digging': '挖土',
      'sunbathing': '晒太阳',
      'playing-with-string': '玩毛线',
      'hunting-toys': '捕猎玩具',
      'climbing': '爬高',
      'scratching': '抓挠',
      'watching-birds': '观鸟',
      'purring': '呼噜声',
      'hiding-in-boxes': '躲纸箱',
      'eating': '吃饭',
      'singing': '唱歌',
      'flying-around': '飞行',
      'playing-with-mirrors': '照镜子',
      'eating-seeds': '吃种子',
      'bathing': '洗澡',
      'climbing-cage': '攀爬',
      'talking': '学说话',
      'preening': '整理羽毛',
      'socializing': '社交',
      'hopping': '跳跃',
      'eating-hay': '吃草',
      'hiding': '躲藏',
      'grooming': '理毛',
      'exploring': '探索',
      'eating-vegetables': '吃蔬菜',
      'running-wheel': '跑轮子',
      'storing-food': '囤食物',
      'digging-bedding': '挖垫料',
      'washing-face': '洗脸',
      'running-around': '跑圈',
      'hiding-in-tunnels': '钻隧道',
      'making-sounds': '发声交流',
      'sleeping-together': '一起睡觉',
      'grooming-each-other': '互相理毛',
      'playing': '玩耍',
      'resting': '休息'
      // 新格式已经是中文，不需要翻译
    }
    
    // 处理逗号分隔的多个活动
    return activities.split(',').map(activity => {
      const trimmedActivity = activity.trim()
      return activityTranslations[trimmedActivity] || trimmedActivity
    }).join('、')
  }

  // 计算年龄（如果数据库中没有年龄信息）
  const calculateAge = (birthDate?: string, deathDate?: string) => {
    if (!birthDate || !deathDate) return '未知'
    
    try {
      let birth: Date
      let death: Date
      
      // 处理时间戳格式（毫秒）
      if (/^\d+$/.test(birthDate)) {
        birth = new Date(parseInt(birthDate))
      } else {
        birth = new Date(birthDate)
      }
      
      if (/^\d+$/.test(deathDate)) {
        death = new Date(parseInt(deathDate))
      } else {
        death = new Date(deathDate)
      }
      
      // 检查日期是否有效
      if (isNaN(birth.getTime()) || isNaN(death.getTime())) {
        console.warn('Invalid dates:', { birthDate, deathDate, birth, death })
        return '未知'
      }
      
      // 如果死亡日期早于出生日期，交换它们（可能是数据录入错误）
      const earlierDate = birth > death ? death : birth
      const laterDate = birth > death ? birth : death
      
      const diffTime = laterDate.getTime() - earlierDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 1) {
        return '不到1天'
      } else if (diffDays < 30) {
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
          return `${years}年${months}个月`
        } else {
          return `${years}年`
        }
      }
    } catch (error) {
      console.error('Age calculation error:', error, { birthDate, deathDate })
      return '未知'
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
                  {/* Pet Photo */}
                  <div className="flex-shrink-0">
                    <OptimizedAvatar
                      src={getMainImage()}
                      alt={memorial.subjectName}
                      size={128}
                      fallbackText={memorial.subjectName.substring(0, 2)}
                      className="w-32 h-32 rounded-xl object-cover shadow-sm"
                    />
                  </div>
                  
                  {/* Pet Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-5xl font-extralight text-slate-900 mb-6">{memorial.subjectName}</h1>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-3 lg:space-y-0 mb-8">
                      <p className="text-lg text-slate-600 font-light">
                        {translateBreed(memorial.breed)} · {memorial.gender === 'male' ? '男孩' : memorial.gender === 'female' ? '女孩' : '未知'}
                      </p>
                      <p className="text-lg text-slate-600 font-light">
                        {translateColor(memorial.color)} · 陪伴了我们{getDisplayAge()}
                      </p>
                    </div>
                    <p className="text-xl text-slate-700 mb-3 font-light">{formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}</p>
                    <p className="text-slate-400 font-light italic">"最温柔的守护者，最忠诚的朋友"</p>
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

      <main className="max-w-6xl mx-auto px-6">

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
                      这里会显示宠物的生活故事...
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
                    {translatePersonalityTraits(memorial.personalityTraits).split('、').map((trait, index) => (
                      <div key={index} className="text-slate-700 font-light">{trait}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Things Card */}
              {memorial.favoriteThings && memorial.favoriteThings.trim() && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-light text-slate-900">最爱的事情</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {translateFavoriteActivities(memorial.favoriteThings).split('、').map((thing, index) => (
                      <span key={index} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm rounded-full font-light">
                        {thing}
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
                      <span className="text-slate-500 font-light">离别日期</span>
                      <span className="text-slate-900 font-light">{formatDate(memorial.deathDate)}</span>
                    </div>
                  )}
                  {memorial.breed && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">品种</span>
                      <span className="text-slate-900 font-light">{translateBreed(memorial.breed)}</span>
                    </div>
                  )}
                  {memorial.gender && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">性别</span>
                      <span className="text-slate-900 font-light">{memorial.gender === 'male' ? '男孩' : '女孩'}</span>
                    </div>
                  )}
                  {memorial.color && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-light">毛色</span>
                      <span className="text-slate-900 font-light">{translateColor(memorial.color)}</span>
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
                {memorial.creatorRelation ? `${memorial.subjectName}的${memorial.creatorRelation}` : `${memorial.subjectName}的守护者`}
              </p>
              <div className="w-12 h-px bg-slate-200 mx-auto mb-8"></div>
              <p className="text-sm text-slate-600 leading-relaxed italic max-w-md mx-auto font-light">
                "感谢每一个人为{memorial.subjectName}留下的美好回忆和温暖寄语。{memorial.subjectName}生前最大的快乐就是给大家带来快乐，能够让它的故事继续传递爱与温暖，我想它一定很开心。"
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
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
