"use client"

import { Heart, Users, Flame, Shield, Globe, Clock } from "lucide-react"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation currentPage="about" />

      {/* Hero区域 */}
      <main className="pt-32">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light text-gray-900 mb-6">关于永念</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              让每一份珍贵的爱都被永远铭记，为心爱的生命创建美好而持久的纪念。
            </p>
          </div>
        </section>

        {/* 使命愿景 */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-6">我们的使命</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                当心爱的宠物或亲人离开我们时，悲伤是自然而深刻的。永念为每一个失去挚爱的人提供一个温暖的空间，
                让美好的回忆得以保存，让爱的故事得以传承。
              </p>
              <p className="text-gray-600 leading-relaxed">
                我们相信，每一个生命都有其独特的价值和意义。通过创建美丽的纪念页面，
                我们帮助您庆祝那些珍贵的时光，与亲朋好友分享温馨回忆，让爱永远流传。
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-8 text-center">
              <Heart className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">爱的传承</h3>
              <p className="text-gray-600">让每一份爱都被永远纪念</p>
            </div>
          </div>
        </section>

        {/* 核心价值 */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-light text-gray-900 text-center mb-12">我们的价值观</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">温暖关怀</h3>
                <p className="text-gray-600">以最温柔的方式陪伴每一位用户度过失去的痛苦</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">隐私保护</h3>
                <p className="text-gray-600">严格保护每一个用户的隐私和纪念内容的安全</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">包容开放</h3>
                <p className="text-gray-600">欢迎所有文化背景的用户，尊重不同的纪念传统</p>
              </div>
            </div>
          </div>
        </section>

        {/* 服务特色 */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">为什么选择永念</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <Users className="w-12 h-12 text-cyan-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">社区支持</h3>
              <p className="text-gray-600">
                与其他经历相似失去的朋友们连接，在理解与同情中获得安慰和力量。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <Flame className="w-12 h-12 text-cyan-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">永恒纪念</h3>
              <p className="text-gray-600">
                通过点亮蜡烛、留言缅怀等方式，让爱的表达持续传递，永不停息。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <Clock className="w-12 h-12 text-cyan-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">永久保存</h3>
              <p className="text-gray-600">
                所有纪念内容都将被安全永久保存，随时可以回来重温美好回忆。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <Heart className="w-12 h-12 text-cyan-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">完全免费</h3>
              <p className="text-gray-600">
                我们相信纪念应该是每个人的权利，所有核心功能都永久免费提供。
              </p>
            </div>
          </div>
        </section>

        {/* 联系信息 */}
        <section className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">与我们联系</h2>
            <p className="text-gray-600 mb-8">
              如果您有任何问题或建议，我们随时为您提供帮助
            </p>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">客服邮箱</h3>
                  <p className="text-cyan-600">support@eternalmemory.cn</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">工作时间</h3>
                  <p className="text-gray-600">周一至周五 9:00-18:00</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}