import Image from "next/image"
import { Heart, Users, Flame, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="human-memorial" />

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                为逝去的亲人创建纪念页
              </h1>
              <p className="text-xl text-purple-500 font-medium">永远怀念</p>
              <p className="text-gray-600 text-lg leading-relaxed">
                为逝去的亲人朋友创建温馨、持久的纪念页面。记录他们的生平故事，分享珍贵的回忆。
                让他们的精神与爱永远传续下去。
              </p>
            </div>

            <Link href="/create-person-obituary">
              <Button className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-3 text-lg rounded-full">
                <Heart className="w-5 h-5 mr-2" />
                创建纪念页面
              </Button>
            </Link>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>永久免费</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>无需信用卡</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>与亲人分享</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-2xl p-4 shadow-lg">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="White dog standing indoors"
                width={400}
                height={300}
                className="rounded-xl object-cover w-full"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">如何使用</h2>
          <p className="text-gray-600 mb-12">不到一分钟就能创建永久的纪念 ⚡</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">我们为您撰写</h3>
              <p className="text-gray-600">
                分享他们的生平信息和珍贵照片 — 我们将为您制作美丽的纪念文，或者您也可以自己撰写
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">与他人连接</h3>
              <p className="text-gray-600">接收来自朋友、家人和亲友们的支持与安慰</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">让记忆永存</h3>
              <p className="text-gray-600">点亮纪念蜡烛，随时访问他们的纪念页面来缅怀与思念</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-teal-500 mb-2">203,847</div>
            <div className="text-gray-600">纪念页面已创建</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-purple-400 mb-2">983,547</div>
            <div className="text-gray-600">纪念蜡烛已点亮</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-pink-400 mb-2">1,756,892</div>
            <div className="text-gray-600">情感寄語</div>
          </div>
        </div>
      </section>

      {/* Recent Person Obituaries */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">最近的纪念页面</h2>
            <p className="text-gray-600">缅怀生命中的珍贵回忆</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                name: "王德华", 
                subtitle: "桃李满天下的好老师", 
                description: "1945-2024，享年79岁 · 退休教师", 
                candles: 156, 
                messages: 89,
                story: "热爱教育事业40年，培养学生无数，深受师生爱戴"
              },
              { 
                name: "李秀英", 
                subtitle: "白衣天使般的母亲", 
                description: "1950-2024，享年74岁 · 退休护士", 
                candles: 203, 
                messages: 127,
                story: "慈祥温柔的母亲，救死扶伤30载，是家人心中的守护神"
              },
              { 
                name: "张建军", 
                subtitle: "深爱家庭的好丈夫", 
                description: "1968-2024，享年56岁 · 高级工程师", 
                candles: 324, 
                messages: 198,
                story: "勤劳敬业的技术专家，用智慧和双手为家庭撑起一片天"
              },
              {
                name: "陈小雨",
                subtitle: "阳光开朗的设计师",
                description: "1995-2024，享年29岁 · 平面设计师",
                candles: 267,
                messages: 145,
                story: "用创意点亮生活，为世界带来美好设计的年轻才女"
              },
              { 
                name: "刘志明", 
                subtitle: "技术带头人", 
                description: "1960-2024，享年64岁 · 高级工程师", 
                candles: 112, 
                messages: 67,
                story: "兢兢业业35年，深受同事敬重，是公司的技术骨干"
              },
              {
                name: "赵雅丽",
                subtitle: "深受师生爱戴的校长",
                description: "1972-2024，享年52岁 · 小学校长",
                candles: 189,
                messages: 103,
                story: "温柔贤惠的姐姐，致力于教育事业，培养了一代又一代孩子"
              },
            ].map((person, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200">
                  <Image
                    src={`/placeholder.svg?height=200&width=200&query=person memorial photo`}
                    alt={person.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{person.name}</h3>
                  <p className="text-purple-500 text-sm mb-1 font-medium">{person.subtitle}</p>
                  <p className="text-gray-600 text-sm mb-2">{person.description}</p>
                  <p className="text-gray-500 text-xs mb-3 leading-relaxed">{person.story}</p>
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
            ))}
          </div>

          <div className="text-center">
            <Link href="/community-person-obituaries">
              <Button
                variant="outline"
                className="border-purple-400 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full bg-transparent"
              >
                查看所有纪念页
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-white/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-gray-600 text-lg">
            在几分钟内创建美丽的纪念页面，给逝去的亲人应有的敬意。
          </p>
          <Link href="/create-person-obituary">
            <Button className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-3 text-lg rounded-full">
              创建纪念页面 →
            </Button>
          </Link>
        </div>
      </section>

      {/* Support Mission */}
      <section className="px-4 py-12 bg-teal-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">支持我们的使命</h3>
              <p className="text-gray-600 text-sm">
                每个生命都值得被永远纪念。您的支持帮助我们为全世界的家庭免费提供纪念服务。
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
