"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CheckCircle, XCircle, Mail, Loader2, AlertCircle } from 'lucide-react'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const token = searchParams.get('token')

    if (success === 'true') {
      setStatus('success')
      setMessage('邮箱验证成功！您现在可以使用所有功能了。')
    } else if (error) {
      setStatus('error')
      switch (error) {
        case 'missing-token':
          setMessage('验证链接缺少令牌，请检查邮件链接是否完整。')
          break
        case 'invalid-token':
          setMessage('验证令牌无效或已过期，请重新发送验证邮件。')
          break
        case 'server-error':
          setMessage('服务器错误，请稍后重试。')
          break
        default:
          setMessage('验证失败，请重试。')
      }
    } else if (token) {
      // 自动验证token
      verifyToken(token)
    } else {
      setStatus('resend')
      setMessage('请输入您的邮箱地址以重新发送验证邮件。')
    }
  }, [searchParams])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || '邮箱验证成功！')
      } else {
        setStatus('error')
        setMessage(data.error || '验证失败')
      }
    } catch (error) {
      setStatus('error')
      setMessage('网络错误，请检查连接后重试。')
    }
  }

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setMessage('请输入邮箱地址')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setStatus('success')
      } else {
        setMessage(data.error)
      }
    } catch (error) {
      setMessage('网络错误，请重试')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">正在验证邮箱...</h1>
            <p className="text-gray-600">请稍候，我们正在验证您的邮箱地址。</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">验证成功！</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  立即登录
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">验证失败</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => setStatus('resend')}
                className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
              >
                重新发送验证邮件
              </Button>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  重新注册
                </Button>
              </Link>
            </div>
          </div>
        )

      case 'resend':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">重新发送验证邮件</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入您的邮箱地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '发送验证邮件'
                )}
              </Button>
              
              <Link href="/login">
                <Button variant="outline" className="w-full">
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
      <Navigation currentPage="home" />
      
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {renderContent()}
          </div>
          
          {/* 帮助信息 */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">没有收到邮件？</p>
                  <ul className="text-left space-y-1">
                    <li>• 请检查垃圾邮件文件夹</li>
                    <li>• 确认邮箱地址是否正确</li>
                    <li>• 邮件可能需要几分钟才能到达</li>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}