import Image from "next/image"
import { Heart, Flame, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function CommunityPersonObituariesPage() {
  const people = [
    {
      name: "李明",
      years: "1950 - 2023",
      age: "73岁",
      relationship: "父亲",
      candles: 12,
      messages: 8,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
    },
    {
      name: "王华",
      years: "1948 - 2024",
      age: "76岁",
      relationship: "母亲",
      candles: 15,
      messages: 6,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
    },
    {
      name: "张伟",
      years: "1965 - 2023",
      age: "58岁",
      relationship: "配偶",
      candles: 20,
      messages: 12,
      image: "/placeholder.svg?height=200&width=200",
      type: "spouse",
    },
    {
      name: "刘小红",
      years: "1992 - 2024",
      age: "32岁",
      relationship: "朋友",
      candles: 8,
      messages: 5,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
    },
    {
      name: "陈建国",
      years: "1955 - 2024",
      age: "69岁",
      relationship: "同事",
      candles: 6,
      messages: 3,
      image: "/placeholder.svg?height=200&width=200",
      type: "colleague",
    },
    {
      name: "赵敏",
      years: "1970 - 2023",
      age: "53岁",
      relationship: "兄弟姐妹",
      candles: 18,
      messages: 9,
      image: "/placeholder.svg?height=200&width=200",
      type: "sibling",
    },
    {
      name: "孙志强",
      years: "1945 - 2024",
      age: "79岁",
      relationship: "亲戚",
      candles: 7,
      messages: 4,
      image: "/placeholder.svg?height=200&width=200",
      type: "relative",
    },
    {
      name: "吴美丽",
      years: "1960 - 2023",
      age: "63岁",
      relationship: "朋友",
      candles: 11,
      messages: 7,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
    },
    {
      name: "黄刚",
      years: "1952 - 2024",
      age: "72岁",
      relationship: "父亲",
      candles: 14,
      messages: 10,
      image: "/placeholder.svg?height=200&width=200",
      type: "parent",
    },
    {
      name: "马晓燕",
      years: "1968 - 2023",
      age: "55岁",
      relationship: "同事",
      candles: 9,
      messages: 6,
      image: "/placeholder.svg?height=200&width=200",
      type: "colleague",
    },
    {
      name: "周建华",
      years: "1958 - 2024",
      age: "66岁",
      relationship: "亲戚",
      candles: 13,
      messages: 8,
      image: "/placeholder.svg?height=200&width=200",
      type: "relative",
    },
    {
      name: "郑小明",
      years: "1975 - 2024",
      age: "49岁",
      relationship: "朋友",
      candles: 16,
      messages: 11,
      image: "/placeholder.svg?height=200&width=200",
      type: "friend",
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
    { name: "所有纪念", active: true },
    { name: "👨 父亲", active: false },
    { name: "👩 母亲", active: false },
    { name: "💑 配偶", active: false },
    { name: "👶 子女", active: false },
    { name: "👥 朋友", active: false },
    { name: "👤 其他", active: false },
  ]

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
                  variant={category.active ? "default" : "outline"}
                  className={`rounded-full ${
                    category.active
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
              <Input placeholder="按名字搜索..." className="pl-10 w-64 rounded-full border-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Person Obituaries Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {people.map((person, index) => (
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
                    <div className="text-purple-500 text-sm mb-4 font-medium">{person.relationship}</div>
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
