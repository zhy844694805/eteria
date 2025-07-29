"use client"

import { Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MemorialSelection } from "@/components/memorial-selection"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                永念 | EternalMemory
              </h1>
              <p className="text-2xl text-teal-500 font-medium">让爱永恒存在</p>
              <p className="text-gray-600 text-xl leading-relaxed max-w-4xl mx-auto">
                为您心爱的人或宠物创建美丽、持久的纪念页面。分享回忆，与他人连接，让他们的精神永远活着。
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>永久免费</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>无需注册</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>与亲人分享</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memorial Type Selection */}
      <MemorialSelection />

      {/* How It Works Section */}
      <section className="px-4 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">如何使用永念</h2>
          <p className="text-gray-600 mb-12">简单三步，创建永恒的纪念 ⚡</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">选择纪念类型</h3>
              <p className="text-gray-600">
                选择您想要纪念的对象 - 心爱的宠物或逝去的亲人朋友
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">填写信息</h3>
              <p className="text-gray-600">上传照片，填写基本信息，我们帮您制作精美的纪念页面</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">分享与纪念</h3>
              <p className="text-gray-600">与家人朋友分享，点亮蜡烛，留下温暖的话语</p>
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
            <div className="text-4xl font-bold text-purple-400 mb-2">1,283,921</div>
            <div className="text-gray-600">蜡烛已点亮</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-4xl font-bold text-pink-400 mb-2">2,456,213</div>
            <div className="text-gray-600">爱的信息</div>
          </div>
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
                每份爱都值得被永远纪念。您的支持帮助我们为更多家庭提供免费的纪念服务。
              </p>
            </div>
          </div>
          <Link href="/donate">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              <Heart className="w-4 h-4 mr-2" />
              进行捐赠
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}