"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Users, 
  Settings as SettingsIcon,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  const { user, logout, updatePreferredSystem, updateUserInfo } = useAuth()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 如果用户未登录，重定向到登录页
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到登录页面...</p>
      </div>
    </div>
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: '姓名不能为空' })
      return
    }

    const success = updateUserInfo({ name: formData.name.trim() })
    if (success) {
      setMessage({ type: 'success', text: '用户信息已保存' })
      setEditMode(false)
    } else {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    }
    
    // 清除消息
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSystemChange = (system: 'pet' | 'human') => {
    updatePreferredSystem(system)
    setMessage({ 
      type: 'success', 
      text: `已切换到${system === 'pet' ? '宠物' : '人类'}纪念系统` 
    })
    
    // 延迟跳转到对应系统
    setTimeout(() => {
      const redirectPath = system === 'pet' ? '/pet-memorial' : '/human-memorial'
      router.push(redirectPath)
    }, 1500)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation />

      {/* Settings Content */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">用户设置</h1>
            <p className="text-gray-600">管理您的账户信息和系统偏好</p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> : 
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              }
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* User Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-500" />
                  个人信息
                </CardTitle>
                <CardDescription>
                  您的基本账户信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    {editMode ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="输入您的姓名"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-800">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{user.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">邮箱地址暂不支持修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      注册时间
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最后登录
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{formatDate(user.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  {editMode ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          setFormData({ name: user.name, email: user.email })
                        }}
                      >
                        取消
                      </Button>
                      <Button onClick={handleSave} className="bg-teal-500 hover:bg-teal-600">
                        <Save className="w-4 h-4 mr-2" />
                        保存更改
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      编辑信息
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-purple-500" />
                  系统偏好
                </CardTitle>
                <CardDescription>
                  选择您偏好的纪念系统
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      当前偏好系统
                    </label>
                    <div className="flex items-center gap-2 mb-4">
                      {user.preferredSystem === 'pet' && (
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                          <Heart className="w-3 h-3 mr-1" />
                          宠物纪念系统
                        </Badge>
                      )}
                      {user.preferredSystem === 'human' && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          <Users className="w-3 h-3 mr-1" />
                          人类纪念系统
                        </Badge>
                      )}
                      {!user.preferredSystem && (
                        <Badge variant="outline">
                          未设置偏好
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      下次访问网站时会自动进入您偏好的系统
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      切换系统
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleSystemChange('pet')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          user.preferredSystem === 'pet'
                            ? 'border-teal-200 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">宠物纪念系统</h3>
                              <p className="text-sm text-gray-600">为心爱的宠物创建纪念页面</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>

                      <button
                        onClick={() => handleSystemChange('human')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          user.preferredSystem === 'human'
                            ? 'border-purple-200 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">人类纪念系统</h3>
                              <p className="text-sm text-gray-600">为逝去的亲人朋友创建纪念页面</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={logout}
                  >
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}