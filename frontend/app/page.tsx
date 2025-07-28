import Image from "next/image"
import { Heart, Users, Star, ArrowRight } from "lucide-react"
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
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">选择纪念类型</h2>
            <p className="text-gray-600 text-lg">请选择您想要纪念的对象</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pet Memorial */}
            <Link href="/pet-memorial">
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-teal-200">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">纪念宠物</h3>
                    <p className="text-gray-600 leading-relaxed">
                      为您心爱的宠物伙伴创建专属的纪念页面。上传照片，分享美好回忆，让它们的爱永远陪伴在您身边。
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-teal-600 font-medium group-hover:text-teal-700">
                      <span>开始创建宠物纪念页</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <span>🐕</span>
                      <span>狗狗</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🐱</span>
                      <span>猫咪</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🐦</span>
                      <span>其他宠物</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Human Memorial */}
            <Link href="/human-memorial">
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200">
                <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">纪念亲人</h3>
                  <p className="text-gray-600 leading-relaxed">
                    为逝去的亲人朋友创建温馨的纪念页面。记录他们的生平故事，分享珍贵时光，让思念化作永恒的纪念。
                  </p>
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-purple-600 font-medium group-hover:text-purple-700">
                    <span>开始创建纪念页面</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span>👨‍👩‍👧‍👦</span>
                    <span>家人</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>朋友</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🤝</span>
                    <span>同事</span>
                  </div>
                </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

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