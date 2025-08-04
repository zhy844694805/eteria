"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from "next/image"
import { Heart, Flame, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
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
  age?: number
  relationship?: string
  occupation?: string
  location?: string
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
  author: {
    id: string
    name: string
    email: string
  }
}

export default function CommunityPersonObituariesPage() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 获取人员纪念页数据
  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=HUMAN&limit=50', {
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

    // 按关系类型过滤
    if (activeFilter !== 'all') {
      filtered = filtered.filter(memorial => {
        const relationship = memorial.relationship?.toLowerCase()
        switch (activeFilter) {
          case 'parent':
            return relationship === 'parent' || relationship === '父母' || relationship === '父亲' || relationship === '母亲'
          case 'spouse':
            return relationship === 'spouse' || relationship === '配偶' || relationship === '爱人'
          case 'child':
            return relationship === 'child' || relationship === '子女' || relationship === '儿子' || relationship === '女儿'
          case 'sibling':
            return relationship === 'sibling' || relationship === '兄弟姐妹' || relationship === '兄弟' || relationship === '姐妹'
          case 'friend':
            return relationship === 'friend' || relationship === '朋友'
          case 'colleague':
            return relationship === 'colleague' || relationship === '同事'
          case 'relative':
            return relationship === 'relative' || relationship === '亲戚'
          default:
            return true
        }
      })
    }

    // 按搜索关键词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(memorial =>
        memorial.subjectName.toLowerCase().includes(query) ||
        memorial.occupation?.toLowerCase().includes(query) ||
        memorial.relationship?.toLowerCase().includes(query) ||
        memorial.location?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [memorials, activeFilter, searchQuery])

  const formatAge = (birthDate: string | null, deathDate: string | null, age?: number) => {
    if (age) return `${age}年`
    if (birthDate && deathDate) {
      const birth = new Date(birthDate)
      const death = new Date(deathDate)
      const years = death.getFullYear() - birth.getFullYear()
      return `${years}年`
    }
    return ''
  }

  const formatDateRange = (birthDate: string | null, deathDate: string | null) => {
    if (birthDate && deathDate) {
      const birth = new Date(birthDate).getFullYear()
      const death = new Date(deathDate).getFullYear()
      return `${birth} - ${death}`
    }
    return ''
  }

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

  const filterCategories = [
    { name: "所有纪念", value: "all" },
    { name: "父母", value: "parent" },
    { name: "配偶", value: "spouse" },
    { name: "子女", value: "child" },
    { name: "兄弟姐妹", value: "sibling" },
    { name: "朋友", value: "friend" },
    { name: "同事", value: "colleague" },
    { name: "亲戚", value: "relative" },
  ]

  // 处理搜索 - 使用搜索API
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (!query.trim()) {
      // 如果搜索为空，重新加载所有人员纪念页
      setIsLoading(true)
      try {
        const response = await fetch('/api/memorials?type=HUMAN&limit=50')
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
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=HUMAN&limit=50`)
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
      <Navigation currentPage="community" />

      {/* Hero Section - 响应式标题 */}
      <main className="pt-20 lg:pt-32">
        <section className="max-w-6xl mx-auto text-center px-4 sm:px-6 pb-12 sm:pb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-3 sm:mb-4">纪念社区</h1>
          <p className="text-slate-600 text-sm sm:text-base">缅怀每一个珍贵的生命</p>
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
                placeholder="搜索姓名、职业、故事..." 
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
                    onClick={() => setActiveFilter(category.value)}
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
                <Link href="/create-person-obituary">
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
                  formatAge={formatAge}
                  translateRelationship={translateRelationship}
                  isPetMemorial={false}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
