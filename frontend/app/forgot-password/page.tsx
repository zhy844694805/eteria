"use client"

import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation />

      {/* Content */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">忘记密码</h1>
            
            {/* Message */}
            <div className="space-y-4 text-gray-600">
              <p>此功能正在开发中。</p>
              <p className="text-sm">
                如果您忘记了密码，请联系我们的技术支持团队获取帮助。
              </p>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回登录
                </Button>
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}