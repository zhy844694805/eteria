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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="community" />

      {/* Hero Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">社区宠物悼念页</h1>
          <p className="text-gray-600 text-lg">庆祝心爱宠物的生命</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category, index) => (
                <Button
                  key={index}
                  variant={activeFilter === category.value ? "default" : "outline"}
                  onClick={() => handleFilterClick(category.value)}
                  className={`rounded-full ${
                    activeFilter === category.value
                      ? "bg-purple-500 hover:bg-purple-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="按名字搜索..." 
                className="pl-10 w-64 rounded-full border-gray-300"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pet Obituaries Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          ) : filteredMemorials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">{memorials.length === 0 ? '暂无宠物纪念页' : '没有找到匹配的纪念页'}</p>
              <Link href="/create-obituary">
                <Button className="bg-purple-500 hover:bg-purple-600">创建第一个纪念页</Button>
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
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-200">
                      <Image
                        src={memorial.images.find(img => img.isMain)?.url || memorial.images[0]?.url || "/placeholder.svg"}
                        alt={memorial.subjectName}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{memorial.subjectName}</h3>
                      <div className="text-gray-600 text-sm mb-1">
                        {formatDateRange(memorial.birthDate, memorial.deathDate)} • {calculateAge(memorial.birthDate, memorial.deathDate)}
                      </div>
                      <div className="text-purple-500 text-sm mb-4 font-medium">
                        {memorial.breed ? `${memorial.subjectType || '宠物'} • ${memorial.breed}` : (memorial.subjectType || '宠物')}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span>{memorial._count.candles} 蜡烛</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <span>{memorial._count.messages} 消息</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-8 h-8 p-0">1</Button>
          <Button variant="outline" className="rounded-full w-8 h-8 p-0 bg-transparent">
            2
          </Button>
          <Button variant="outline" className="rounded-full w-8 h-8 p-0 bg-transparent">
            3
          </Button>
          <span className="text-gray-400">...</span>
          <Button variant="outline" className="rounded-full w-8 h-8 p-0 bg-transparent">
            5
          </Button>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
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
              <h3 className="font-semibold text-gray-800">Support Our Mission</h3>
              <p className="text-gray-600 text-sm">
                Every pet deserves a beautiful memorial. Your support helps us keep Tuckerly free for grieving pet
                parents everywhere.
              </p>
            </div>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            Make a Donation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
