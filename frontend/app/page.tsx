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
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                为您的爱宠创建免费悼念页
              </h1>
              <p className="text-xl text-teal-500 font-medium">永恒存在</p>
              <p className="text-gray-600 text-lg leading-relaxed">
                为您心爱的宠物创建美丽、持久的纪念。我们可以为您撰写，或者您也可以自己撰写。
                分享回忆，与他人连接，让它们的精神永远活着。
              </p>
            </div>

            <Button className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-3 text-lg rounded-full">
              <Heart className="w-5 h-5 mr-2" />
              创建免费宠物悼念页
            </Button>

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
                分享您宠物的详细信息和照片 — 我们将为您制作美丽的讴告，或者您也可以自己撰写
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">与他人连接</h3>
              <p className="text-gray-600">接收来自朋友、家人和同好宠物爱好者的支持与安慰</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">让它们的记忆永存</h3>
              <p className="text-gray-600">点亮虚拟蜡烛，随时访问它们的纪念页面来缅怀</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-teal-500 mb-2">203,847</div>
            <div className="text-gray-600">宠物悼念页已创建</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-purple-400 mb-2">1,283,921</div>
            <div className="text-gray-600">蜡烛已点亮</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-pink-400 mb-2">2,456,213</div>
            <div className="text-gray-600">爱的信息</div>
          </div>
        </div>
      </section>

      {/* Recent Pet Obituaries */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">最近的宠物悼念页</h2>
            <p className="text-gray-600">庆祝生命和珍藏的回忆</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { name: "Nemo", subtitle: "永远在我们心中", breed: "金毛寻回犬", candles: 5, messages: 2 },
              { name: "Jaxon", subtitle: "永远在我们心中", breed: "比格犬", candles: 5, messages: 1 },
              { name: "Nico", subtitle: "永远在我们心中", breed: "金毛寻回犬", candles: 3, messages: 1 },
              {
                name: "Palmer",
                subtitle: "永远在我们心中",
                breed: "美国短毛猫",
                candles: 3,
                messages: 2,
              },
              { name: "Goccia", subtitle: "永远在我们心中", breed: "虎斑猫", candles: 2, messages: 1 },
              {
                name: "Koschei",
                subtitle: "永远在我们心中",
                breed: "美国短毛猫",
                candles: 1,
                messages: 1,
              },
            ].map((pet, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200">
                  <Image
                    src={`/placeholder.svg?height=200&width=200&query=${pet.name} ${pet.breed} pet`}
                    alt={pet.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{pet.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{pet.subtitle}</p>
                  <p className="text-gray-600 text-sm mb-3">{pet.breed}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{pet.candles} 蜡烛</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{pet.messages} 消息</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/community-pet-obituaries">
              <Button
                variant="outline"
                className="border-teal-400 text-teal-600 hover:bg-teal-50 px-8 py-3 rounded-full bg-transparent"
              >
                查看所有悼念页
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-white/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-gray-600 text-lg">
            在几分钟内创建免费的悼念页，给您心爱的宠物应有的敬意。
          </p>
          <Button className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-3 text-lg rounded-full">
            创建免费宠物悼念页 →
          </Button>
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
                每只宠物都值得拥有美丽的纪念。您的支持帮助我们为全世界正在悲伤的宠物主人免费提供永念服务。
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
