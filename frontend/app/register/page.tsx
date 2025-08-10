"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Heart, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { GoogleLoginButton } from '@/components/google-login-button'
import type { RegisterFormData } from '@/lib/types/auth'

function RegisterWithParams() {
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 表单验证
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填项')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
    }
  }

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除错误信息
    if (error) setError('')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Header - 极简浮动导航 */}
      <ResponsiveNavigation currentPage="home" />

      {/* Register Form - 极简设计 */}
      <main className="pt-32">
        <section className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200">
            {/* Logo - 极简化 */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-light text-slate-900 mb-2">加入永念</h1>
              <p className="text-slate-600 font-light">创建您的纪念账户</p>
            </div>

            {/* Error Message - 极简错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </div>
            )}

            {/* Register Form - 极简表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="输入您的姓名"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 border-slate-300 rounded-2xl focus:border-slate-400 focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    placeholder="至少6位密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 border-slate-300 rounded-2xl focus:border-slate-400 focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="password"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
                {isLoading ? '注册中...' : '创建账户'}
              </button>
            </form>

            {/* 分割线 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500 font-light">或</span>
              </div>
            </div>

            {/* Google 注册按钮 */}
            <GoogleLoginButton isLoading={isLoading} buttonText="使用Google注册" />

            {/* Agreement - 极简协议区 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 mb-4 font-light">
                注册即表示您同意我们的{' '}
                <Link href="/terms" className="text-slate-900 hover:text-slate-700">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link href="/privacy" className="text-slate-900 hover:text-slate-700">
                  隐私政策
                </Link>
              </p>
              
              <div className="text-sm text-slate-600 font-light">
                已有账户？{' '}
                <Link 
                  href="/login" 
                  className="text-slate-900 hover:text-slate-700 font-medium"
                >
                  立即登录
                </Link>
              </div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-light">加载中...</p>
        </div>
      </div>
    }>
      <RegisterWithParams />
    </Suspense>
  )
}