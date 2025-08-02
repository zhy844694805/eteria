"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function MemorialSelection() {
  const { user, updatePreferredSystem } = useAuth()
  const router = useRouter()

  // 移除自动重定向逻辑，让用户可以停留在主页选择系统

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

  // 移除重定向状态显示，始终显示选择界面

  return (
    <section className="max-w-4xl mx-auto px-6 pb-20">
      <h2 className="text-2xl font-light text-gray-900 text-center mb-12">选择纪念类型</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 宠物纪念系统 */}
        <div 
          className="bg-white rounded-2xl p-8 border border-gray-200 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 group"
          onClick={() => handleSystemChoice('pet')}
        >
          {/* 卡片头部 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-2">爱宠纪念</h3>
            <p className="text-gray-600 text-sm">PET MEMORIAL</p>
          </div>

          {/* 简化描述 */}
          <p className="text-gray-600 text-sm leading-relaxed text-center mb-6">
            为您心爱的宠物朋友创建温馨的纪念页面，记录它们带给您的欢乐时光与美好回忆
          </p>

          {/* 功能亮点 - 极简版 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center py-3">
              <div className="text-sm text-gray-700">个性化档案</div>
              <div className="text-xs text-gray-500 mt-1">品种、性格、习惯</div>
            </div>
            <div className="text-center py-3">
              <div className="text-sm text-gray-700">成长时光</div>
              <div className="text-xs text-gray-500 mt-1">照片、视频、故事</div>
            </div>
            <div className="text-center py-3">
              <div className="text-sm text-gray-700">社区分享</div>
              <div className="text-xs text-gray-500 mt-1">宠物主人交流</div>
            </div>
            <div className="text-center py-3">
              <div className="text-sm text-gray-700">永久保存</div>
              <div className="text-xs text-gray-500 mt-1">云端存储备份</div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="text-center">
            <div className="inline-flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
              <span className="text-sm">为爱宠创建纪念</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 人员纪念系统 */}
        <div 
          className="bg-white rounded-2xl p-8 border border-gray-200 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 group"
          onClick={() => handleSystemChoice('human')}
        >
          {/* 卡片头部 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-2">逝者纪念</h3>
            <p className="text-gray-600 text-sm">HUMAN MEMORIAL</p>
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
          <div className="text-center">
            <div className="inline-flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
              <span className="text-sm">为逝者创建纪念</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}