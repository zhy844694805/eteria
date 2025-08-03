"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Heart, Flame, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

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
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 获取人员纪念页数据
  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=HUMAN&limit=50')
        const data = await response.json()
        
        if (response.ok) {
          setMemorials(data.memorials)
          setFilteredMemorials(data.memorials)
        } else {
          setError(data.error || '获取纪念页失败')
        }
      } catch (error) {
        console.error('Fetch memorials error:', error)
        setError('网络错误')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemorials()
  }, [])

  // 过滤纪念页
  useEffect(() => {
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
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(memorial =>
        memorial.subjectName.toLowerCase().includes(query) ||
        memorial.occupation?.toLowerCase().includes(query) ||
        memorial.relationship?.toLowerCase().includes(query) ||
        memorial.location?.toLowerCase().includes(query)
      )
    }

    setFilteredMemorials(filtered)
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

  const filterCategories = [
    { name: "所有纪念", value: "all" },
    { name: "👨👩 父母", value: "parent" },
    { name: "💕 配偶", value: "spouse" },
    { name: "👶 子女", value: "child" },
    { name: "👥 兄弟姐妹", value: "sibling" },
    { name: "👫 朋友", value: "friend" },
    { name: "💼 同事", value: "colleague" },
    { name: "👤 亲戚", value: "relative" },
  ]

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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="搜索纪念页面..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredMemorials.map((memorial) => {
                const mainImage = memorial.images.find(img => img.isMain) || memorial.images[0]
                const ageDisplay = formatAge(memorial.birthDate, memorial.deathDate, memorial.age)
                const dateRange = formatDateRange(memorial.birthDate, memorial.deathDate)
                
                return (
                  <Link
                    key={memorial.id}
                    href={`/community-person-obituaries/${memorial.slug}`}
                    className="block"
                  >
                    <div className="memorial-card bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-slate-100">
                        <Image
                          src={mainImage?.url || "/placeholder.svg"}
                          alt={memorial.subjectName}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-slate-900 mb-2">{memorial.subjectName}</h3>
                        <p className="text-slate-500 text-sm mb-1">
                          {dateRange && `${dateRange} • `}{ageDisplay}
                        </p>
                        <p className="text-slate-500 text-sm mb-3">
                          {memorial.relationship} {memorial.occupation && `• ${memorial.occupation}`}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            <span>{memorial._count.candles}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{memorial._count.messages}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
