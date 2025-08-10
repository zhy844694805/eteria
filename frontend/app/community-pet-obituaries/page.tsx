"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from "next/image"
import { Heart, Flame, Search, Loader2 } from "lucide-react"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import MemorialCard from "@/components/memorial-card"
import { CommunityGridSkeleton, EmptyState, ErrorState } from "@/components/loading-skeletons"

interface Memorial {
  id: string
  slug: string
  subjectName: string
  type: string
  birthDate: string | null
  deathDate: string | null
  subjectType?: string
  breed?: string
  color?: string
  images: Array<{
    id: string
    url: string
    isMain: boolean
  }>
  _count: {
    messages: number
    candles: number
    likes: number
  }
}

export default function CommunityPetObituariesPage() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 获取宠物纪念页数据
  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=PET&limit=50', {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? '未找到纪念页' : '获取纪念页失败')
        }
        
        const data = await response.json()
        
        if (!abortController.signal.aborted) {
          setMemorials(data.memorials || [])
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && !abortController.signal.aborted) {
          console.error('Fetch memorials error:', error)
          setError(error.message || '网络错误')
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchMemorials()
    
    return () => abortController.abort()
  }, [])

  // 使用useMemo优化过滤逻辑
  const filteredMemorials = useMemo(() => {
    let filtered = memorials

    // 按宠物类型过滤
    if (activeFilter !== 'all') {
      filtered = filtered.filter(memorial => {
        const petType = memorial.subjectType?.toLowerCase()
        switch (activeFilter) {
          case 'dog':
            return petType === 'dog' || petType === '狗'
          case 'cat':
            return petType === 'cat' || petType === '猫'
          case 'bird':
            return petType === 'bird' || petType === '鸟'
          case 'rabbit':
            return petType === 'rabbit' || petType === '兔子'
          case 'hamster':
            return petType === 'hamster' || petType === '仓鼠'
          case 'other':
            return petType === 'guinea-pig' || petType === '豚鼠' || petType === 'other' || petType === '其他'
          default:
            return true
        }
      })
    }

    // 按名字搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(memorial =>
        memorial.subjectName.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [memorials, activeFilter, searchQuery])

  // 格式化日期范围
  const formatDateRange = (birth: string | null, death: string | null) => {
    const birthYear = birth ? new Date(birth).getFullYear() : '?'
    const deathYear = death ? new Date(death).getFullYear() : '?'
    return `${birthYear} - ${deathYear}`
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
      'other-bird': '其他鸟类',
      
      // 兔子品种
      'holland-lop': '荷兰垂耳兔',
      'mini-rex': '迷你雷克斯兔',
      'netherland-dwarf': '荷兰侏儒兔',
      'lionhead': '狮子头兔',
      'flemish-giant': '佛兰德巨兔',
      'angora': '安哥拉兔',
      'rex': '雷克斯兔',
      'dutch': '荷兰兔',
      'english-lop': '英国垂耳兔',
      'mini-lop': '迷你垂耳兔',
      'other-rabbit': '其他兔种',
      
      // 仓鼠品种
      'syrian': '叙利亚仓鼠',
      'dwarf-hamster': '侏儒仓鼠',
      'chinese': '中国仓鼠',
      'roborovski': '罗伯罗夫斯基仓鼠',
      'other-hamster': '其他仓鼠',
      
      // 豚鼠品种
      'american-guinea-pig': '美国豚鼠',
      'peruvian-guinea-pig': '秘鲁豚鼠',
      'abyssinian-guinea-pig': '阿比西尼亚豚鼠',
      'silkie-guinea-pig': '丝毛豚鼠',
      'other-guinea-pig': '其他豚鼠'
    }
    
    return breedTranslations[breed.toLowerCase()] || breed
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
    
    return typeTranslations[type.toLowerCase()] || type
  }

  // 计算年龄
  const calculateAge = (birth: string | null, death: string | null) => {
    if (!birth || !death) return '未知年龄'
    
    const birthDate = new Date(birth)
    const deathDate = new Date(death)
    
    if (deathDate < birthDate) return '日期无效'
    
    const diffTime = deathDate.getTime() - birthDate.getTime()
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
        return `${years}年${months}个月`
      } else {
        return `${years}年`
      }
    }
  }


  const filterCategories = [
    { name: "所有宠物", value: "all" },
    { name: "狗", value: "dog" },
    { name: "猫", value: "cat" },
    { name: "鸟", value: "bird" },
    { name: "兔子", value: "rabbit" },
    { name: "仓鼠", value: "hamster" },
    { name: "其他", value: "other" },
  ]

  // 处理筛选器点击
  const handleFilterClick = (filterValue: string) => {
    setActiveFilter(filterValue)
  }

  // 处理搜索 - 使用搜索API
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (!query.trim()) {
      // 如果搜索为空，重新加载所有宠物纪念页
      setIsLoading(true)
      try {
        const response = await fetch('/api/memorials?type=PET&limit=50')
        if (response.ok) {
          const data = await response.json()
          setMemorials(data.memorials || [])
        }
      } catch (error) {
        console.error('Error reloading memorials:', error)
      } finally {
        setIsLoading(false)
      }
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=PET&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setMemorials(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <ResponsiveNavigation currentPage="community" />

      {/* Hero Section - 响应式标题 */}
      <main className="pt-20 lg:pt-32">
        <section className="max-w-6xl mx-auto text-center px-4 sm:px-6 pb-12 sm:pb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-3 sm:mb-4">纪念社区</h1>
          <p className="text-slate-600 text-sm sm:text-base">每一个生命都值得被纪念</p>
        </section>

        {/* 筛选器 - 响应式设计 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
            {/* 搜索框 - 移动端优先 */}
            <div className="relative order-2 sm:order-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              )}
              <input 
                placeholder="搜索宠物名字、品种、故事..." 
                className="pl-10 pr-4 py-3 w-full sm:w-64 md:w-80 rounded-2xl border border-slate-300 focus:border-slate-400 focus:outline-none bg-white text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* 筛选器按钮 - 移动端优化 */}
            <div className="order-1 sm:order-2">
              <div className="flex flex-wrap gap-2 sm:gap-2">
                {filterCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterClick(category.value)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeFilter === category.value
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 纪念网格 - 响应式卡片 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          {isLoading || isSearching ? (
            <CommunityGridSkeleton />
          ) : error ? (
            <ErrorState 
              title="加载失败"
              description={error}
              onRetry={() => window.location.reload()}
            />
          ) : filteredMemorials.length === 0 ? (
            <EmptyState
              icon={Search}
              title={memorials.length === 0 ? '还没有纪念页面' : '没有找到匹配的纪念页'}
              description={memorials.length === 0 ? '成为第一个创建纪念页的人，让爱永远传承' : '尝试调整搜索条件或筛选器'}
              action={memorials.length === 0 ? (
                <Link href="/create-obituary">
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                    创建第一个纪念
                  </button>
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setActiveFilter('all')
                  }}
                  className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-slate-400 transition-colors"
                >
                  清除筛选条件
                </button>
              )}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMemorials.map((memorial) => (
                <MemorialCard
                  key={memorial.id}
                  memorial={memorial}
                  formatDateRange={formatDateRange}
                  calculateAge={calculateAge}
                  translatePetType={translatePetType}
                  translateBreed={translateBreed}
                  isPetMemorial={true}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  )
}
