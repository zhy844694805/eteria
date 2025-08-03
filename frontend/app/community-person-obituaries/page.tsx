"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from "next/image"
import { Heart, Flame, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import MemorialCard from "@/components/memorial-card"

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

      {/* Hero Section - 极简大气 */}
      <main className="pt-32">
        <section className="max-w-5xl mx-auto text-center px-6 pb-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-light text-slate-900 leading-tight">
              社区纪念
              <span className="block text-xl font-normal text-slate-500 mt-2">缅怀每一个珍贵的生命</span>
            </h1>
          </div>
        </section>

        {/* Filter Section - 极简筛选 */}
        <section className="max-w-6xl mx-auto px-6 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFilter(category.value)}
                  className={`px-6 py-2 rounded-xl text-sm transition-colors ${
                    activeFilter === category.value
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              )}
              <Input 
                placeholder="搜索姓名、职业、故事..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 w-64 rounded-xl border-slate-200 bg-white" 
              />
            </div>
          </div>
        </section>

        {/* Person Obituaries Grid - 极简网格 */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">正在加载纪念页面...</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-light text-slate-800 mb-4">加载失败</h3>
              <p className="text-slate-500 mb-8">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                重新加载
              </button>
            </div>
          )}

          {/* 结果统计 */}
          {!isLoading && !error && (
            <div className="mb-8">
              <p className="text-slate-500 text-sm">
                {searchQuery ? 
                  `搜索 "${searchQuery}" 找到 ${filteredMemorials.length} 个结果` : 
                  `共 ${filteredMemorials.length} 个纪念页面`
                }
              </p>
            </div>
          )}

          {!isLoading && !error && filteredMemorials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
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
          ) : !isLoading && !error ? (
            // 空状态 - 极简
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-light text-slate-800 mb-4">没有找到相关纪念页面</h3>
              <p className="text-slate-500 mb-8">
                {searchQuery ? 
                  `搜索 "${searchQuery}" 没有找到匹配的结果，请尝试其他关键词` : 
                  `当前筛选条件下没有纪念页面，请尝试其他分类`
                }
              </p>
              <div className="flex justify-center gap-4">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:border-slate-400 transition-colors"
                  >
                    清除搜索
                  </button>
                )}
                <button 
                  onClick={() => {
                    setActiveFilter("all")
                    setSearchQuery("")
                  }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  查看所有纪念
                </button>
              </div>
            </div>
          ) : null}
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
