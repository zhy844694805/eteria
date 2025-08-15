"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Heart, Users, Flame, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

interface Memorial {
  id: string
  slug: string
  subjectName: string
  relationship?: string
  age?: string
  occupation?: string
  images: Array<{
    id: string
    url: string
    isMain: boolean
  }>
  // 支持两种数据结构：新的直接字段和旧的_count对象
  candleCount?: number
  messageCount?: number
  _count?: {
    messages: number
    candles: number
  }
}

export default function HomePage() {
  const [recentMemorials, setRecentMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 获取最近的人员纪念页
  useEffect(() => {
    const fetchRecentMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=HUMAN&limit=6&sort=recent')
        const data = await response.json()
        
        if (response.ok) {
          setRecentMemorials(data.memorials)
        }
      } catch (error) {
        console.error('获取最近纪念页失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentMemorials()
  }, [])

  // 翻译关系
  const translateRelationship = (relationship?: string) => {
    if (!relationship) return ''
    
    const relationshipTranslations: { [key: string]: string } = {
      'parent': '父母',
      'spouse': '配偶',
      'child': '子女',
      'sibling': '兄弟姐妹',
      'relative': '亲戚',
      'friend': '朋友',
      'colleague': '同事',
      'other': '其他'
    }
    
    return relationshipTranslations[relationship] || relationship
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <ResponsiveNavigation currentPage="human-memorial" />

      {/* Hero Section - 极简大气 */}
      <main className="pt-32">
        <section className="max-w-4xl mx-auto text-center px-6 pb-20">
          <div className="space-y-8">
            <h1 className="text-6xl font-light text-slate-900 leading-tight">
              永念
              <span className="block text-3xl font-normal text-slate-500 mt-2">让爱永恒存在</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-light">
              为您心爱的人创建美丽、持久的纪念页面<br />
              分享回忆，与他人连接，让他们的精神永远活着
            </p>
          </div>
        </section>

        {/* Memorial Type Selection */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-light text-gray-900 text-center mb-12">选择服务</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 逝者纪念系统 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
              {/* 卡片头部 */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">逝者纪念</h3>
                <p className="text-gray-600 text-sm">逝者纪念</p>
              </div>

              {/* 简化描述 */}
              <p className="text-gray-600 text-sm leading-relaxed text-center mb-6">
                为逝去的亲人朋友创建永恒的纪念空间，分享他们的生平故事与珍贵记忆
              </p>

              {/* 功能亮点 - 极简版 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">生平档案</div>
                  <div className="text-xs text-gray-500 mt-1">职业、成就、关系</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">珍贵回忆</div>
                  <div className="text-xs text-gray-500 mt-1">照片、信件、录音</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">追思留言</div>
                  <div className="text-xs text-gray-500 mt-1">亲友共同缅怀</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">传承精神</div>
                  <div className="text-xs text-gray-500 mt-1">家族历史记录</div>
                </div>
              </div>

              {/* 行动按钮 */}
              <div className="text-center space-y-4">
                <Link href="/create-person-obituary">
                  <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                    创建纪念页面
                  </button>
                </Link>
                <Link href="/community-person-obituaries">
                  <button className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-xl text-sm hover:border-slate-400 transition-colors">
                    浏览纪念社区
                  </button>
                </Link>
              </div>
            </div>

            {/* 数字生命系统 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
              {/* 卡片头部 */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">数字生命</h3>
                <p className="text-gray-600 text-sm">AI对话系统</p>
              </div>

              {/* 简化描述 */}
              <p className="text-gray-600 text-sm leading-relaxed text-center mb-6">
                基于逝者的声音样本和对话记录，创建AI驱动的数字生命，让您能够与他们继续对话交流
              </p>

              {/* 功能亮点 - 极简版 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">声音克隆</div>
                  <div className="text-xs text-gray-500 mt-1">还原真实语音</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">智能对话</div>
                  <div className="text-xs text-gray-500 mt-1">模拟性格特征</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">记忆传承</div>
                  <div className="text-xs text-gray-500 mt-1">保存珍贵对话</div>
                </div>
                <div className="text-center py-3">
                  <div className="text-sm text-gray-700">情感陪伴</div>
                  <div className="text-xs text-gray-500 mt-1">心理慰藉支持</div>
                </div>
              </div>

              {/* 行动按钮 */}
              <div className="text-center">
                <Link href="/digital-life-home">
                  <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                    创建数字生命
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

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
                <Users className="w-6 h-6 text-slate-600" />
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

        {/* 最近纪念页 - 极简展示 */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-light text-slate-800 mb-4">最近的纪念</h2>
            <p className="text-slate-600">每一个生命都值得被纪念</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              // 加载状态 - 极简骨架屏
              [...Array(6)].map((_, index) => (
                <div key={index} className="memorial-card bg-white rounded-3xl overflow-hidden border border-slate-200 animate-pulse">
                  <div className="aspect-square bg-slate-100"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-3"></div>
                    <div className="h-3 bg-slate-200 rounded mb-2 w-3/4"></div>
                    <div className="flex gap-4 mt-4">
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentMemorials.length > 0 ? (
              // 真实数据 - 极简卡片
              recentMemorials.map((memorial) => (
                <Link
                  key={memorial.id}
                  href={`/community-person-obituaries/${memorial.slug}`}
                  className="block"
                >
                  <div className="memorial-card bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer">
                    <div className="aspect-square bg-slate-100">
                      <Image
                        src={memorial.images.find(img => img.isMain)?.url || memorial.images[0]?.url || "/placeholder.svg"}
                        alt={memorial.subjectName}
                        width={240}
                        height={240}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{memorial.subjectName}</h3>
                      <p className="text-slate-500 text-sm mb-3">
                        {translateRelationship(memorial.relationship)}
                        {memorial.age ? ` • 享年${memorial.age}岁` : ''}
                        {memorial.occupation ? ` • ${memorial.occupation}` : ''}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{memorial.candleCount || memorial._count?.candles || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{memorial.messageCount || memorial._count?.messages || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // 无数据状态 - 极简
              <div className="col-span-3 text-center py-16 text-slate-500">
                <p className="mb-6">还没有纪念页面</p>
                <Link href="/create-person-obituary">
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 transition-colors">
                    创建第一个纪念
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/community-person-obituaries">
              <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-2xl hover:border-slate-400 transition-colors">
                查看全部纪念
              </button>
            </Link>
          </div>
        </section>


      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
