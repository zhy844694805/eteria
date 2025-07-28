import Image from "next/image"
import { Heart, Flame, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function CommunityPetObituariesPage() {
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
    { name: "所有宠物", active: true },
    { name: "🐕 狗", active: false },
    { name: "🐱 猫", active: false },
    { name: "🐦 鸟", active: false },
    { name: "🐰 兔子", active: false },
    { name: "🐹 仓鼠", active: false },
    { name: "🐾 其他", active: false },
  ]

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

      {/* Pet Obituaries Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {pets.map((pet, index) => (
              <Link
                key={index}
                href={`/community-pet-obituaries/${pet.name.toLowerCase()}-${pet.type.toLowerCase()}-2023-${generateSlug(pet.name)}`}
                className="block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-200">
                    <Image
                      src={pet.image || "/placeholder.svg"}
                      alt={pet.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{pet.name}</h3>
                    <div className="text-gray-600 text-sm mb-1">
                      {pet.years} • {pet.age}
                    </div>
                    <div className="text-purple-500 text-sm mb-4 font-medium">{pet.breed}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>{pet.candles} 蜡烛</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>{pet.messages} 消息</span>
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
