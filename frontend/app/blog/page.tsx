"use client"

import { Heart, Calendar, User, ArrowRight } from "lucide-react"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

// 模拟博客文章数据
const blogPosts = [
  {
    id: 1,
    title: "如何度过失去宠物的痛苦时光",
    excerpt: "失去心爱的宠物是人生中最痛苦的经历之一。本文将为您提供一些温暖的建议，帮助您在这个艰难的时期找到安慰和力量。",
    author: "永念团队",
    date: "2024年1月15日",
    readTime: "5分钟阅读",
    category: "悲伤指导",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    id: 2,
    title: "创建有意义的宠物纪念仪式",
    excerpt: "纪念仪式可以帮助我们表达对宠物的爱，并开始愈合过程。了解如何为您的伙伴创建一个温暖而有意义的告别仪式。",
    author: "李梅医生",
    date: "2024年1月10日",
    readTime: "7分钟阅读",
    category: "纪念指南",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    id: 3,
    title: "孩子失去宠物时的心理支持",
    excerpt: "当家庭宠物去世时，孩子们需要特别的关爱和理解。学习如何帮助孩子处理失去的情感，并从中获得成长。",
    author: "王小云心理师",
    date: "2024年1月5日",
    readTime: "6分钟阅读",
    category: "家庭支持",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    id: 4,
    title: "保存宠物回忆的创意方法",
    excerpt: "除了传统的照片和视频，还有许多创意方式来保存和庆祝与宠物的美好时光。探索这些温暖的纪念创意。",
    author: "张艺术师",
    date: "2023年12月28日",
    readTime: "4分钟阅读",
    category: "创意纪念",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    id: 5,
    title: "宠物生命末期的陪伴与关怀",
    excerpt: "在宠物生命的最后阶段，我们的陪伴比以往任何时候都更加珍贵。了解如何为年老或生病的宠物提供最好的关爱。",
    author: "赵兽医师",
    date: "2023年12月20日",
    readTime: "8分钟阅读",
    category: "护理指导",
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    id: 6,
    title: "建立宠物纪念花园的指南",
    excerpt: "为您的宠物创建一个美丽的纪念花园，让自然的美丽成为永恒回忆的载体。从植物选择到设计布局的完整指南。",
    author: "刘园艺师",
    date: "2023年12月15日",
    readTime: "10分钟阅读",
    category: "纪念项目",
    image: "/placeholder.svg?height=200&width=300"
  }
]

const categories = ["全部", "悲伤指导", "纪念指南", "家庭支持", "创意纪念", "护理指导", "纪念项目"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation currentPage="blog" />

      <main className="pt-32">
        {/* Hero区域 */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-6">永念博客</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              获取关于陪伴悲伤的温暖指引，以及纪念挚爱的美好方式
            </p>
          </div>
        </section>

        {/* 分类筛选 */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  category === "全部"
                    ? "bg-cyan-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* 博客文章网格 */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-cyan-600" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-medium text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:text-cyan-600 transition-colors" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 加载更多 */}
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-2xl hover:border-gray-400 transition-colors">
              加载更多文章
            </button>
          </div>
        </section>

        {/* 订阅通讯 */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-4">订阅我们的通讯</h2>
            <p className="text-gray-600 mb-8">
              获取最新的悲伤指导文章和纪念灵感，直接发送到您的邮箱
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-cyan-500"
              />
              <button className="bg-cyan-500 text-white px-6 py-3 rounded-2xl hover:bg-cyan-600 transition-colors">
                订阅
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}