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
  subjectType?: string
  breed?: string
  images: Array<{
    id: string
    url: string
    isMain: boolean
  }>
  _count: {
    messages: number
    candles: number
  }
}

export default function HomePage() {
  const [recentMemorials, setRecentMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 获取最近的宠物纪念页
  useEffect(() => {
    const fetchRecentMemorials = async () => {
      try {
        const response = await fetch('/api/memorials?type=PET&limit=6&sort=recent')
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

  // 翻译宠物类型
  const translatePetType = (type?: string) => {
    if (!type) return '宠物'
    
    const typeTranslations: { [key: string]: string } = {
      'dog': '狗',
      'cat': '猫',
      'bird': '鸟',
      'rabbit': '兔子',
      'hamster': '仓鼠',
      'guinea-pig': '豚鼠',
      'other': '其他'
    }
    
    return typeTranslations[type.toLowerCase()] || type
  }

  // 翻译品种名称
  const translateBreed = (breed?: string) => {
    if (!breed) return '未知'
    
    const breedTranslations: { [key: string]: string } = {
      // 狗类品种
      'labrador': '拉布拉多',
      'golden-retriever': '金毛寻回犬',
      'german-shepherd': '德国牧羊犬',
      'bulldog': '斗牛犬',
      'poodle': '贵宾犬',
      'husky': '哈士奇',
      'chihuahua': '吉娃娃',
      'shiba-inu': '柴犬',
      'corgi': '柯基',
      'beagle': '比格犬',
      'border-collie': '边境牧羊犬',
      'rottweiler': '罗威纳',
      'yorkshire-terrier': '约克夏梗',
      'dachshund': '腊肠犬',
      'boxer': '拳师犬',
      'australian-shepherd': '澳洲牧羊犬',
      'siberian-husky': '西伯利亚雪橇犬',
      'great-dane': '大丹犬',
      'pomeranian': '博美',
      'shih-tzu': '西施犬',
      'boston-terrier': '波士顿梗',
      'bernese-mountain-dog': '伯恩山犬',
      'french-bulldog': '法国斗牛犬',
      'cocker-spaniel': '可卡犬',
      'maltese': '马尔济斯',
      'mixed-breed-dog': '混种犬',
      'other-dog': '其他犬种',
      
      // 猫类品种
      'persian': '波斯猫',
      'maine-coon': '缅因猫',
      'siamese': '暹罗猫',
      'ragdoll': '布偶猫',
      'british-shorthair': '英国短毛猫',
      'american-shorthair': '美国短毛猫',
      'scottish-fold': '苏格兰折耳猫',
      'russian-blue': '俄罗斯蓝猫',
      'bengal': '孟加拉猫',
      'abyssinian': '阿比西尼亚猫',
      'birman': '伯曼猫',
      'exotic-shorthair': '异国短毛猫',
      'norwegian-forest': '挪威森林猫',
      'sphynx': '斯芬克斯猫',
      'oriental-shorthair': '东方短毛猫',
      'devon-rex': '德文卷毛猫',
      'turkish-angora': '土耳其安哥拉猫',
      'munchkin': '曼基康猫',
      'domestic-shorthair': '家养短毛猫',
      'domestic-longhair': '家养长毛猫',
      'mixed-breed-cat': '混种猫',
      'other-cat': '其他猫种',
      
      // 鸟类品种
      'canary': '金丝雀',
      'budgerigar': '虎皮鹦鹉',
      'cockatiel': '玄凤鹦鹉',
      'lovebird': '爱情鸟',
      'macaw': '金刚鹦鹉',
      'african-grey': '非洲灰鹦鹉',
      'cockatoo': '凤头鹦鹉',
      'conure': '锥尾鹦鹉',
      'finch': '雀',
      'parakeet': '长尾小鹦鹉',
      'other-bird': '其他鸟类',
      
      // 兔子品种
      'holland-lop': '荷兰垂耳兔',
      'mini-rex': '迷你雷克斯兔',
      'netherland-dwarf': '荷兰侏儒兔',
      'lionhead': '狮子头兔',
      'flemish-giant': '佛兰德巨兔',
      'angora': '安哥拉兔',
      'rex': '雷克斯兔',
      'dutch': '荷兰兔',
      'english-lop': '英国垂耳兔',
      'mini-lop': '迷你垂耳兔',
      'other-rabbit': '其他兔种',
      
      // 仓鼠品种
      'syrian': '叙利亚仓鼠',
      'dwarf-hamster': '侏儒仓鼠',
      'chinese': '中国仓鼠',
      'roborovski': '罗伯罗夫斯基仓鼠',
      'other-hamster': '其他仓鼠',
      
      // 豚鼠品种
      'american-guinea-pig': '美国豚鼠',
      'peruvian-guinea-pig': '秘鲁豚鼠',
      'abyssinian-guinea-pig': '阿比西尼亚豚鼠',
      'silkie-guinea-pig': '丝毛豚鼠',
      'other-guinea-pig': '其他豚鼠'
    }
    
    return breedTranslations[breed.toLowerCase()] || breed
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <ResponsiveNavigation currentPage="pet-memorial" />

      {/* Hero Section - 极简大气 */}
      <main className="pt-32">
        <section className="max-w-5xl mx-auto text-center px-6 pb-20">
          <div className="space-y-8">
            <h1 className="text-5xl font-light text-slate-900 leading-tight">
              爱宠纪念
              <span className="block text-2xl font-normal text-slate-500 mt-2">为心爱的宠物创建永恒纪念</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-light">
              为您心爱的宠物创建美丽、持久的纪念页面<br />
              分享珍贵回忆，与他人连接，让它们的精神永远陪伴
            </p>
            
            {/* 行动按钮 */}
            <div className="flex items-center justify-center space-x-4 pt-8">
              <Link href="/create-obituary">
                <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-base hover:bg-slate-800 transition-colors flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>开始创建</span>
                </button>
              </Link>
              <Link href="/community-pet-obituaries">
                <button className="border border-slate-300 text-slate-700 px-10 py-4 rounded-2xl text-base hover:border-slate-400 transition-colors flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>浏览社区</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* 功能特点 - 极简网格 */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">精心制作</h3>
              <p className="text-slate-600 text-sm leading-relaxed">为每一位爱宠创建独特而美丽的纪念页面</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">共同缅怀</h3>
              <p className="text-slate-600 text-sm leading-relaxed">与朋友家人一起分享珍贵回忆</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">永恒纪念</h3>
              <p className="text-slate-600 text-sm leading-relaxed">点亮蜡烛，让爱永远传递</p>
            </div>
          </div>
        </section>

        {/* 统计数据 - 极简展示 */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">203,847</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">爱宠纪念</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">1,283,921</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">点亮蜡烛</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-slate-900">2,456,213</div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">爱的留言</div>
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
                  href={`/community-pet-obituaries/${memorial.slug}`}
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
                        {memorial.breed ? `${translatePetType(memorial.subjectType)} • ${translateBreed(memorial.breed)}` : translatePetType(memorial.subjectType)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          <span>{memorial._count.candles}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{memorial._count.messages}</span>
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
                <Link href="/create-obituary">
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 transition-colors">
                    创建第一个纪念
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/community-pet-obituaries">
              <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-2xl hover:border-slate-400 transition-colors">
                查看全部纪念
              </button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
