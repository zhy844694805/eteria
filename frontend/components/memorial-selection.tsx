"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function MemorialSelection() {
  const { user, updatePreferredSystem } = useAuth()
  const router = useRouter()

  // 如果用户已登录且有偏好系统，自动重定向
  useEffect(() => {
    if (user?.preferredSystem) {
      const redirectPath = user.preferredSystem === 'pet' ? '/pet-memorial' : '/human-memorial'
      router.push(redirectPath)
    }
  }, [user, router])

  const handleSystemChoice = (system: 'pet' | 'human') => {
    // 如果用户已登录，保存偏好并重定向
    if (user) {
      updatePreferredSystem(system)
      const redirectPath = system === 'pet' ? '/pet-memorial' : '/human-memorial'
      router.push(redirectPath)
    } else {
      // 未登录用户直接访问系统
      const redirectPath = system === 'pet' ? '/pet-memorial' : '/human-memorial'
      router.push(redirectPath)
    }
  }

  // 如果用户已登录且有偏好，不显示选择界面（正在重定向）
  if (user?.preferredSystem) {
    return (
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">正在跳转到您的纪念系统...</h2>
            <p className="text-gray-600">请稍候</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">选择纪念类型</h2>
          <p className="text-gray-600 text-lg">请选择您想要纪念的对象</p>
          {user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                欢迎回来，{user.name}！选择纪念类型后，我们会记住您的偏好，下次访问时直接进入对应系统。
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pet Memorial */}
          <button
            onClick={() => handleSystemChoice('pet')}
            className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-teal-200 text-left w-full"
          >
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
          </button>

          {/* Human Memorial */}
          <button
            onClick={() => handleSystemChoice('human')}
            className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200 text-left w-full"
          >
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
          </button>
        </div>

        {/* Login prompt for guests */}
        {!user && (
          <div className="text-center mt-12 p-6 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">想要更好的体验吗？</h3>
            <p className="text-gray-600 mb-4">
              登录后我们会记住您的偏好，下次访问时直接进入您选择的纪念系统
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}