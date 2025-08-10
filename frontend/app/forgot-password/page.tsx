"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('请输入邮箱地址')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setMessage('')
    setStatus('loading')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error || '发送失败，请重试')
      }
    } catch (error) {
      setStatus('error')
      setMessage('网络错误，请检查连接后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'form':
      case 'loading':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">忘记密码</h1>
              <p className="text-gray-600">输入您的邮箱地址，我们将发送重置密码的链接</p>
            </div>

            {status === 'error' && message && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="输入您的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '发送重置邮件'
                )}
              </Button>
            </form>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">邮件已发送</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setStatus('form')
                  setEmail('')
                  setMessage('')
                }}
                variant="outline" 
                className="w-full"
              >
                重新发送
              </Button>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  返回登录
                </Button>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <ResponsiveNavigation currentPage="home" />

      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {renderContent()}
            
            {/* Back to Login */}
            {status === 'form' && (
              <div className="mt-6 text-center">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回登录
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Help Information */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">没有收到邮件？</p>
                  <ul className="text-left space-y-1">
                    <li>• 请检查垃圾邮件文件夹</li>
                    <li>• 确认邮箱地址是否正确</li>
                    <li>• 重置链接将在1小时后过期</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}