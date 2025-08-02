"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Heart, Flame, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 获取宠物纪念页数据
  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=PET&limit=50')
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
      filtered = filtered.filter(memorial =>
        memorial.subjectName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    }

    setFilteredMemorials(filtered)
  }, [memorials, activeFilter, searchQuery])

  // 格式化日期范围
  const formatDateRange = (birth: string | null, death: string | null) => {
    const birthYear = birth ? new Date(birth).getFullYear() : '?'
    const deathYear = death ? new Date(death).getFullYear() : '?'
    return `${birthYear} - ${deathYear}`
  }

  // 计算年龄
  const calculateAge = (birth: string | null, death: string | null) => {
    if (!birth || !death) return '未知年龄'
    const birthDate = new Date(birth)
    const deathDate = new Date(death)
    const years = deathDate.getFullYear() - birthDate.getFullYear()
    return `${years} 岁`
  }

  const pets = [
    {
      name: "Nemo",
      years: "2010 - 2023",
      age: "12 years",
      breed: "美国短毛猫",
      candles: 5,
      messages: 2,
      image: "/placeholder.svg?height=200&width=200",
      type: "cat",
    },
    {
      name: "Jaxon",
      years: "2014 - 2024",
      age: "10 years",
      breed: "拳师犬",
      candles: 6,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
    {
      name: "Nico",
      years: "2001 - 2014",
      age: "12 years",
      breed: "金毛寻回犬",
      candles: 3,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
    {
      name: "Palmer",
      years: "2013 - 2024",
      age: "11 years",
      breed: "美国短毛猫",
      candles: 5,
      messages: 2,
      image: "/placeholder.svg?height=200&width=200",
      type: "cat",
    },
    {
      name: "Goccia",
      years: "2010 - 2024",
      age: "14 years",
      breed: "虎斑猫",
      candles: 2,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "cat",
    },
    {
      name: "Koschei",
      years: "2017 - 2025",
      age: "8 years",
      breed: "美国短毛猫",
      candles: 3,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "cat",
    },
    {
      name: "Albert",
      years: "2019 - 2025",
      age: "6 years",
      breed: "豚鼠",
      candles: 4,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "other",
    },
    {
      name: "Belle",
      years: "2010 - 2024",
      age: "14 years",
      breed: "马尔济斯犬",
      candles: 2,
      messages: 1,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
    {
      name: "Rocky",
      years: "2025 - 2025",
      age: "9 months",
      breed: "拳师犬",
      candles: 4,
      messages: 3,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
    {
      name: "Lila",
      years: "2009 - 2023",
      age: "14 years",
      breed: "混种",
      candles: 4,
      messages: 2,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
    {
      name: "Anderson",
      years: "2010 - 2025",
      age: "14 years",
      breed: "兔子",
      candles: 5,
      messages: 3,
      image: "/placeholder.svg?height=200&width=200",
      type: "rabbit",
    },
    {
      name: "Wilson",
      years: "2016 - 2024",
      age: "7 years",
      breed: "混种",
      candles: 7,
      messages: 4,
      image: "/placeholder.svg?height=200&width=200",
      type: "dog",
    },
  ]

  const generateSlug = (name: string) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 6) + "h2"
    )
  }

  const filterCategories = [
    { name: "所有宠物", value: "all" },
    { name: "🐕 狗", value: "dog" },
    { name: "🐱 猫", value: "cat" },
    { name: "🐦 鸟", value: "bird" },
    { name: "🐰 兔子", value: "rabbit" },
    { name: "🐹 仓鼠", value: "hamster" },
    { name: "🐾 其他", value: "other" },
  ]

  // 处理筛选器点击
  const handleFilterClick = (filterValue: string) => {
    setActiveFilter(filterValue)
  }

  // 处理搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <Navigation currentPage="community" />

      {/* Hero Section - 极简标题 */}
      <main className="pt-32">
        <section className="max-w-6xl mx-auto text-center px-6 pb-16">
          <h1 className="text-4xl font-light text-slate-900 mb-4">纪念社区</h1>
          <p className="text-slate-600">每一个生命都值得被纪念</p>
        </section>

        {/* 筛选器 - 极简风格 */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterClick(category.value)}
                  className={`px-4 py-2 rounded-2xl text-sm transition-colors ${
                    activeFilter === category.value
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                placeholder="按名字搜索..." 
                className="pl-10 pr-4 py-2 w-64 rounded-2xl border border-slate-300 focus:border-slate-400 focus:outline-none bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </section>

        {/* 纪念网格 - 极简卡片 */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-slate-900 text-white px-6 py-2 rounded-2xl hover:bg-slate-800 transition-colors"
              >
                重试
              </button>
            </div>
          ) : filteredMemorials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-6">{memorials.length === 0 ? '还没有纪念页面' : '没有找到匹配的纪念页'}</p>
              <Link href="/create-obituary">
                <button className="bg-slate-900 text-white px-6 py-2 rounded-2xl hover:bg-slate-800 transition-colors">
                  创建第一个纪念
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredMemorials.map((memorial) => (
                <Link
                  key={memorial.id}
                  href={`/community-pet-obituaries/${memorial.slug}`}
                  className="block"
                >
                  <div className="memorial-card bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer">
                    <div className="aspect-square bg-slate-100">
                      <Image
                        src={memorial.images.find(img => img.isMain)?.url || memorial.images[0]?.url || "/placeholder.svg"}
                        alt={memorial.subjectName}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{memorial.subjectName}</h3>
                      <div className="text-slate-500 text-sm mb-1">
                        {formatDateRange(memorial.birthDate, memorial.deathDate)} • {calculateAge(memorial.birthDate, memorial.deathDate)}
                      </div>
                      <div className="text-slate-600 text-sm mb-4">
                        {memorial.breed ? `${memorial.subjectType || '宠物'} • ${memorial.breed}` : (memorial.subjectType || '宠物')}
                      </div>
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
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  )
}
