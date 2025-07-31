"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Heart, Flame, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function CommunityPersonObituariesPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const people = [
    {
      name: "王德华",
      years: "1945 - 2024",
      age: "79岁",
      relationship: "父亲",
      candles: 156,
      messages: 89,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
      occupation: "退休教师",
      description: "热爱教育事业40年，桃李满天下的好老师"
    },
    {
      name: "李秀英",
      years: "1950 - 2024",
      age: "74岁",
      relationship: "母亲",
      candles: 203,
      messages: 127,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
      occupation: "退休医护人员",
      description: "慈祥温柔的母亲，救死扶伤30载的白衣天使"
    },
    {
      name: "张建军",
      years: "1968 - 2024",
      age: "56岁",
      relationship: "爱人",
      candles: 324,
      messages: 198,
      image: "/placeholder.svg?height=200&width=200",
      type: "spouse",
      occupation: "工程师",
      description: "深爱家庭的好丈夫，勤劳敬业的技术专家"
    },
    {
      name: "陈小雨",
      years: "1995 - 2024",
      age: "29岁",
      relationship: "朋友",
      candles: 267,
      messages: 145,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
      occupation: "设计师",
      description: "阳光开朗的女孩，用创意点亮生活的优秀设计师"
    },
    {
      name: "刘志明",
      years: "1960 - 2024",
      age: "64岁",
      relationship: "同事",
      candles: 112,
      messages: 67,
      image: "/placeholder.svg?height=200&width=200",
      type: "colleague",
      occupation: "高级工程师",
      description: "兢兢业业35年，深受同事敬重的技术带头人"
    },
    {
      name: "赵雅丽",
      years: "1972 - 2024",
      age: "52岁",
      relationship: "兄弟姐妹",
      candles: 189,
      messages: 103,
      image: "/placeholder.svg?height=200&width=200",
      type: "sibling",
      occupation: "小学校长",
      description: "温柔贤惠的姐姐，深受师生爱戴的教育工作者"
    },
    {
      name: "孙国庆",
      years: "1943 - 2024",
      age: "81岁",
      relationship: "亲戚",
      candles: 134,
      messages: 78,
      image: "/placeholder.svg?height=200&width=200",
      type: "relative",
      occupation: "退休干部",
      description: "慈祥的长辈，为国家建设贡献一生的老干部"
    },
    {
      name: "吴梅花",
      years: "1955 - 2024",
      age: "69岁",
      relationship: "朋友",
      candles: 145,
      messages: 86,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
      occupation: "退休会计",
      description: "心地善良的好邻居，热心公益的社区志愿者"
    },
    {
      name: "黄文斌",
      years: "1952 - 2024",
      age: "72岁",
      relationship: "父亲",
      candles: 278,
      messages: 156,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
      occupation: "退休工人",
      description: "勤劳朴实的父亲，用双手撑起整个家庭的好男人"
    },
    {
      name: "马春兰",
      years: "1965 - 2024",
      age: "59岁",
      relationship: "同事",
      candles: 167,
      messages: 94,
      image: "/placeholder.svg?height=200&width=200",
      type: "colleague",
      occupation: "护士长",
      description: "医者仁心30载，深受患者信赖的优秀护理工作者"
    },
    {
      name: "周建国",
      years: "1948 - 2024",
      age: "76岁",
      relationship: "亲戚",
      candles: 198,
      messages: 115,
      image: "/placeholder.svg?height=200&width=200",
      type: "relative",
      occupation: "退休厂长",
      description: "德高望重的长辈，带领企业发展的杰出管理者"
    },
    {
      name: "郑慧敏",
      years: "1978 - 2024",
      age: "46岁",
      relationship: "朋友",
      candles: 234,
      messages: 132,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
      occupation: "中学教师",
      description: "桃李满天下的好老师，用爱心浇灌每一个学生"
    },
    {
      name: "林雅婷",
      years: "1985 - 2024",
      age: "39岁",
      relationship: "爱人",
      candles: 456,
      messages: 287,
      image: "/placeholder.svg?height=200&width=200",
      type: "spouse",
      occupation: "医生",
      description: "温柔贤惠的妻子，救死扶伤的好医生，家人心中的天使"
    },
    {
      name: "王志华",
      years: "1975 - 2024",
      age: "49岁",
      relationship: "爱人",
      candles: 378,
      messages: 221,
      image: "/placeholder.svg?height=200&width=200",
      type: "spouse",
      occupation: "企业家",
      description: "事业有成的好丈夫，用爱和责任守护家庭的男人"
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
    { name: "所有纪念", value: "all" },
    { name: "👨 父亲", value: "father" },
    { name: "👩 母亲", value: "mother" },
    { name: "💕 爱人", value: "spouse" },
    { name: "👶 子女", value: "child" },
    { name: "👥 朋友", value: "friend" },
    { name: "👤 其他", value: "other" },
  ]

  // 筛选和搜索逻辑
  const filteredPeople = useMemo(() => {
    let filtered = people

    // 按类别筛选
    if (activeFilter !== "all") {
      filtered = filtered.filter(person => {
        switch (activeFilter) {
          case "father":
            return person.relationship === "父亲"
          case "mother":  
            return person.relationship === "母亲"
          case "spouse":
            return person.relationship === "爱人" || person.relationship === "配偶"
          case "child":
            return person.relationship === "子女" || person.relationship === "儿子" || person.relationship === "女儿"
          case "friend":
            return person.relationship === "朋友"
          case "other":
            return !["父亲", "母亲", "爱人", "配偶", "子女", "儿子", "女儿", "朋友"].includes(person.relationship)
          default:
            return true
        }
      })
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(query) ||
        person.occupation.toLowerCase().includes(query) ||
        person.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [people, activeFilter, searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="community" />

      {/* Hero Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">社区纪念页面</h1>
          <p className="text-gray-600 text-lg">缅怀逝去亲人的生命</p>
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
                  onClick={() => setActiveFilter(category.value)}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 rounded-full border-gray-300" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Person Obituaries Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 结果统计 */}
          <div className="mb-6">
            <p className="text-gray-600">
              {searchQuery ? 
                `搜索 "${searchQuery}" 找到 ${filteredPeople.length} 个结果` : 
                `共 ${filteredPeople.length} 个纪念页面`
              }
            </p>
          </div>

          {filteredPeople.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredPeople.map((person, index) => (
              <Link
                key={index}
                href={`/community-person-obituaries/${person.name.toLowerCase()}-${person.type.toLowerCase()}-2023-${generateSlug(person.name)}`}
                className="block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-200">
                    <Image
                      src={person.image || "/placeholder.svg"}
                      alt={person.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{person.name}</h3>
                    <div className="text-gray-600 text-sm mb-1">
                      {person.years} • {person.age}
                    </div>
                    <div className="text-purple-500 text-sm mb-1 font-medium">{person.relationship}</div>
                    <div className="text-blue-600 text-sm mb-2 font-medium">{person.occupation}</div>
                    <div className="text-gray-500 text-xs mb-4 leading-relaxed">{person.description}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>{person.candles} 蜡烛</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>{person.messages} 消息</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            // 空状态
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">没有找到相关纪念页面</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 
                  `搜索 "${searchQuery}" 没有找到匹配的结果，请尝试其他关键词` : 
                  `当前筛选条件下没有纪念页面，请尝试其他分类`
                }
              </p>
              <div className="flex justify-center gap-4">
                {searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="rounded-full"
                  >
                    清除搜索
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setActiveFilter("all")
                    setSearchQuery("")
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full"
                >
                  查看所有纪念
                </Button>
              </div>
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
              <h3 className="font-semibold text-gray-800">支持我们的使命</h3>
              <p className="text-gray-600 text-sm">
                每个生命都值得被美丽地纪念。您的支持帮助我们为失去亲人的家庭提供免费的纪念服务。
              </p>
            </div>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            进行捐赠
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
