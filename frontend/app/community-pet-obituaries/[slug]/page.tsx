"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, Download, Copy, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { toast } from "sonner"

interface Memorial {
  id: string
  title: string
  slug: string
  type: 'PET' | 'HUMAN'
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
  const [message, setMessage] = useState("")
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // 点燃蜡烛
  const handleLightCandle = async () => {
    if (!memorial) return

    try {
      const response = await fetch(`/api/candles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorialId: memorial.id,
          lightedBy: '匿名',
          message: ''
        })
      })

      if (!response.ok) {
        throw new Error('点燃蜡烛失败')
      }

      // 重新获取数据以更新蜡烛数量
      fetchMemorial()
      toast.success('蜡烛已点燃')
    } catch (error) {
      console.error('点燃蜡烛失败:', error)
      toast.error('点燃蜡烛失败')
    }
  }

  // 发送留言
  const handleSendMessage = async () => {
    if (!memorial || !message.trim()) return

    try {
      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memorialId: memorial.id,
          content: message.trim(),
          authorName: '匿名访客'
        })
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || '纪念页不存在'}</p>
          <Button onClick={() => window.history.back()}>返回</Button>
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="community" />

      {/* Main Content */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left Column - Pet Photo and Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="aspect-square">
                <Image
                  src={getMainImage()}
                  alt={memorial.subjectName}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pet Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{memorial.subjectName}</h2>
              <div className="text-gray-600 mb-4">
                {formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">年龄</span>
                  <span className="text-gray-800">{getDisplayAge()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">类型</span>
                  <span className="text-gray-800">{translatePetType(memorial.subjectType)}</span>
                </div>
                {memorial.breed && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">品种</span>
                    <span className="text-gray-800">{translateBreed(memorial.breed)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">颜色</span>
                  <span className="text-gray-800">{translateColor(memorial.color)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">性别</span>
                  <span className="text-gray-800">{memorial.gender === 'male' ? '雄性' : memorial.gender === 'female' ? '雌性' : '未知'}</span>
                </div>
              </div>
            </div>

            {/* Candle Lighting */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{memorial.candleCount}</div>
              <div className="text-gray-600 text-sm mb-4">为 {memorial.subjectName} 祈祷的蜡烛</div>
              <Button
                onClick={handleLightCandle}
                className="w-full bg-teal-400 hover:bg-teal-500 text-white rounded-full"
              >
                点燃蜡烛
              </Button>
            </div>

            {/* Download Obituary */}
            <Button
              variant="outline"
              className="w-full mb-6 border-teal-400 text-teal-600 hover:bg-teal-50 rounded-full bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              下载纪念文档
            </Button>

            {/* Partnership */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">合作伙伴</div>
              <div className="font-semibold text-gray-800 mb-1">Crystal Soucy, 宠物失落悲伤</div>
              <div className="font-semibold text-gray-800 mb-2">指导师/认证悲伤教育者</div>
              <div className="text-xs text-gray-500">
                网站:{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  www.crystalsoucy.com
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Obituary and Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">纪念 {memorial.subjectName}</h1>

              {/* 生平故事 */}
              {memorial.story && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">生平故事</h3>
                  <div className="prose prose-gray max-w-none">
                    {memorial.story.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-gray-600 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 美好回忆 */}
              {memorial.memories && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">美好回忆</h3>
                  <div className="prose prose-gray max-w-none">
                    {memorial.memories.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-gray-600 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 性格特点 */}
              {memorial.personalityTraits && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">性格特点</h3>
                  <p className="text-gray-600 leading-relaxed">{memorial.personalityTraits}</p>
                </div>
              )}

              {/* 喜好 */}
              {memorial.favoriteThings && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">喜好</h3>
                  <p className="text-gray-600 leading-relaxed">{memorial.favoriteThings}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">
                    {memorial.author.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">作者 {memorial.author.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(memorial.publishedAt || memorial.createdAt)}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-sm text-gray-600 mb-4">分享 {memorial.subjectName} 的纪念页</div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleShareFacebook}>
                    分享
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-800 text-gray-800 bg-transparent"
                    onClick={handleShareTwitter}
                  >
                    发推
                  </Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSharePinterest}>
                    收藏
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShareEmail}>
                    <Mail className="w-4 h-4 mr-1" />
                    邮件
                  </Button>
                  <Button size="sm" className="bg-teal-400 hover:bg-teal-500 text-white" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Memories */}
      {memorial.images.length > 0 && (
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">珍贵回忆</h2>
            <div className="grid grid-cols-3 gap-4">
              {memorial.images.map((image, index) => (
                <div key={image.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${memorial.subjectName}的回忆`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Messages of Love */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">爱的留言</h2>

          {/* Leave a Message */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">留下爱的寄语</h3>
            <Textarea
              placeholder="分享一段回忆或留下爱的寄语..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-teal-400 hover:bg-teal-500 text-white rounded-full px-6 disabled:bg-gray-300"
              >
                发送
              </Button>
            </div>
          </div>

          {/* Existing Messages */}
          <div className="space-y-4">
            {memorial.messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-600 mb-4">{msg.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{msg.user?.name || msg.authorName}</span>
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
              </div>
            ))}
            {memorial.messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                还没有留言，成为第一个留言的人吧
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Support Mission */}
      <section className="px-4 py-12 bg-teal-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">支持我们的使命</h3>
              <p className="text-gray-600 text-sm">
                每只宠物都应该拥有美好的纪念。您的支持帮助我们为世界各地失去宠物的主人免费提供永念服务。
              </p>
            </div>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            捐赠支持
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
