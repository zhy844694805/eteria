"use client"

import { Star, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import { MemorialSelection } from "@/components/memorial-selection"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <ResponsiveNavigation currentPage="home" />

      {/* Hero Section - 极简大气 */}
      <main className="pt-32">
        <section className="max-w-4xl mx-auto text-center px-6 pb-20">
          <div className="space-y-8">
            <h1 className="text-6xl font-light text-slate-900 leading-tight">
              永念
              <span className="block text-3xl font-normal text-slate-500 mt-2">让爱永恒存在</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-light">
              为您心爱的人或宠物创建美丽、持久的纪念页面<br />
              分享回忆，与他人连接，让他们的精神永远活着
            </p>
            
          </div>
        </section>

      {/* Memorial Type Selection */}
      <MemorialSelection />

        {/* 功能特点 - 极简网格 */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">简单快速</h3>
              <p className="text-slate-600 text-sm leading-relaxed">三步完成创建，无需复杂操作</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">永久免费</h3>
              <p className="text-slate-600 text-sm leading-relaxed">永远免费使用，无任何隐藏费用</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">共同纪念</h3>
              <p className="text-slate-600 text-sm leading-relaxed">与家人朋友一起分享美好回忆</p>
            </div>
          </div>
        </section>

        {/* 统计数据 - 极简展示 */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">203,847</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">纪念页面</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">1,283,921</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">点亮蜡烛</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">2,456,213</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">爱的信息</div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}