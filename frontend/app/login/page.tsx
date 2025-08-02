"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react'
import type { LoginFormData } from '@/lib/types/auth'

// 简化的登录组件
function LoginWithParams() {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('请填写所有必填项')
      return
    }

    try {
      await login(formData.email, formData.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除错误信息
    if (error) setError('')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <Navigation currentPage="home" />

      {/* Login Form - 极简设计 */}
      <main className="pt-32">
        <section className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200">
            {/* Logo - 极简化 */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-light text-slate-900 mb-2">欢迎回来</h1>
              <p className="text-slate-600 font-light">登录您的永念账户</p>
            </div>

            {/* Error Message - 极简错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </div>
            )}

            {/* Login Form - 极简表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="输入您的邮箱"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-slate-300 rounded-2xl focus:border-slate-400 focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="password"
                    placeholder="输入您的密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 border-slate-300 rounded-2xl focus:border-slate-400 focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl transition-colors font-medium"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>

            {/* Links - 极简链接 */}
            <div className="mt-6 text-center">
              <div className="text-sm text-slate-600 mb-2 font-light">
                还没有账户？{' '}
                <Link 
                  href="/register" 
                  className="text-slate-900 hover:text-slate-700 font-medium"
                >
                  立即注册
                </Link>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                忘记密码？
              </Link>
            </div>
          </div>

          {/* Back to Home - 极简返回链接 */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-slate-500 hover:text-slate-700 text-sm font-light"
            >
              ← 返回首页
            </Link>
          </div>
        </section>
      </main>

      {/* 极简页脚 */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">© 2024 永念 | EternalMemory. 让每一份爱都被永远纪念.</p>
        </div>
      </footer>
    </div>
  )
}

// 主页面组件，使用 Suspense 包装
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-light">加载中...</p>
        </div>
      </div>
    }>
      <LoginWithParams />
    </Suspense>
  )
}