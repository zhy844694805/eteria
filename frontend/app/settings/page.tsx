"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { migrationService } from '@/lib/migration-service'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsSkeleton, MemorialCardSkeleton, EmptyState, ErrorState } from '@/components/loading-skeletons'
import { systemToasts, memorialToasts } from '@/lib/toast-helper'
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
  Save,
  Database,
  Upload,
  PenIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  Bell
} from 'lucide-react'

interface Memorial {
  id: string
  title: string
  slug: string
  type: 'PET' | 'HUMAN'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  subjectName: string
  subjectType?: string
  createdAt: string
  publishedAt?: string
  viewCount: number
  messageCount: number
  candleCount: number
  images: Array<{
    id: string
    url: string
    isMain: boolean
  }>
}

function SettingsForm() {
  const { user, logout, updatePreferredSystem, updateUserInfo, autoDetectAndSetPreferredSystem } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [hasDataToMigrate, setHasDataToMigrate] = useState(false)
  const [migrationStats, setMigrationStats] = useState({ petCount: 0, humanCount: 0, totalCount: 0 })
  
  // 纪念页管理状态
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [memorialsLoading, setMemorialsLoading] = useState(true)
  
  // 通知设置状态
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(true)

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

  // 如果用户未登录，重定向到登录页
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // 自动检测用户偏好系统
  useEffect(() => {
    if (user && !user.preferredSystem) {
      // 从浏览器历史或referrer检测用户访问的系统
      const referrer = document.referrer
      if (referrer) {
        const url = new URL(referrer)
        autoDetectAndSetPreferredSystem(url.pathname)
      }
    }
  }, [user, autoDetectAndSetPreferredSystem])

  // 检查是否有数据需要迁移
  useEffect(() => {
    const hasData = migrationService.hasDataToMigrate()
    const stats = migrationService.getMigrationStats()
    
    setHasDataToMigrate(hasData)
    setMigrationStats(stats)
    
    // 获取用户纪念页和通知设置
    if (user) {
      fetchMemorials()
      fetchNotificationSettings()
    }
  }, [user])

  // 获取用户纪念页
  const fetchMemorials = async () => {
    try {
      const response = await fetch(`/api/memorials/user/${user!.id}`)
      if (!response.ok) {
        throw new Error('获取纪念页失败')
      }
      const data = await response.json()
      setMemorials(data.memorials)
    } catch (error) {
      console.error('获取纪念页失败:', error)
    } finally {
      setMemorialsLoading(false)
    }
  }

  // 获取用户通知设置
  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`/api/user/notification-settings?userId=${user!.id}`)
      if (response.ok) {
        const data = await response.json()
        setEmailNotificationEnabled(data.settings.emailNotificationEnabled)
      }
    } catch (error) {
      console.error('获取通知设置失败:', error)
    }
  }

  // 更新邮件通知设置
  const handleEmailNotificationChange = async (enabled: boolean) => {
    try {
      const response = await fetch(`/api/user/notification-settings?userId=${user!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotificationEnabled: enabled
        })
      })

      if (response.ok) {
        setEmailNotificationEnabled(enabled)
        setMessage({ 
          type: 'success', 
          text: enabled ? '邮件通知已开启' : '邮件通知已关闭' 
        })
      } else {
        throw new Error('更新设置失败')
      }
    } catch (error) {
      console.error('更新邮件通知设置失败:', error)
      setMessage({ 
        type: 'error', 
        text: '更新通知设置失败，请重试' 
      })
    }
    
    // 清除消息
    setTimeout(() => setMessage(null), 3000)
  }

  // 删除纪念页
  const handleDeleteMemorial = async (memorialId: string) => {
    if (!confirm('是否确认删除此纪念页？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/memorials/${memorialId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      setMessage({ type: 'success', text: '纪念页已删除' })
      fetchMemorials()
    } catch (error) {
      console.error('删除失败:', error)
      setMessage({ type: 'error', text: '删除失败' })
    }
    
    // 清除消息
    setTimeout(() => setMessage(null), 3000)
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="default">已发布</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">草稿</Badge>
      case 'ARCHIVED':
        return <Badge variant="outline">已归档</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // 获取类型徽章
  const getTypeBadge = (type: string) => {
    return type === 'PET' ? 
      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">宠物纪念</Badge> :
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">逝者纪念</Badge>
  }

  // 获取主图片
  const getMainImage = (memorial: Memorial) => {
    const mainImage = memorial.images.find(img => img.isMain) || memorial.images[0]
    return mainImage?.url || '/placeholder-memorial.jpg'
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600 font-light">正在跳转到登录页面...</p>
      </div>
    </div>
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: '姓名不能为空' })
      return
    }

    try {
      const success = await updateUserInfo({ name: formData.name.trim() })
      if (success) {
        setMessage({ type: 'success', text: '用户信息已保存' })
        setEditMode(false)
      } else {
        setMessage({ type: 'error', text: '保存失败，请重试' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    }
    
    // 清除消息
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSystemChange = async (system: 'pet' | 'human') => {
    try {
      await updatePreferredSystem(system)
      setMessage({ 
        type: 'success', 
        text: `偏好已设置为${system === 'pet' ? '宠物' : '人类'}纪念系统，正在跳转...` 
      })
      
      // 立即跳转到对应系统
      setTimeout(() => {
        const redirectPath = system === 'pet' ? '/pet-memorial' : '/human-memorial'
        router.push(redirectPath)
      }, 1000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '设置偏好失败，请重试' 
      })
    }
  }

  // 获取偏好系统的显示文本
  const getPreferredSystemText = () => {
    if (!user?.preferredSystem) {
      // 基于用户的纪念页类型自动推断偏好
      const petCount = memorials.filter(m => m.type === 'PET').length
      const humanCount = memorials.filter(m => m.type === 'HUMAN').length
      
      if (petCount > humanCount) {
        return { system: 'pet', text: '宠物纪念系统', auto: true }
      } else if (humanCount > petCount) {
        return { system: 'human', text: '人类纪念系统', auto: true }
      } else {
        return { system: null, text: '未设置偏好', auto: false }
      }
    }
    
    return {
      system: user.preferredSystem,
      text: user.preferredSystem === 'pet' ? '宠物纪念系统' : '人类纪念系统',
      auto: false
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ResponsiveNavigation />

      {/* Settings Content */}
      <section className="px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-3">设置</h1>
            <p className="text-gray-600 font-light">管理您的账户信息和偏好设置</p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-white border border-gray-200 text-gray-700' 
                : 'bg-white border border-gray-200 text-gray-700'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-gray-600" /> : 
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-gray-600" />
              }
              <span className="text-sm font-light">{message.text}</span>
            </div>
          )}

          {/* Data Migration Alert */}
          {hasDataToMigrate && (
            <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">发现本地数据</p>
                    <p className="text-gray-600 text-sm font-light leading-relaxed">
                      找到 {migrationStats.totalCount} 个本地纪念页（
                      {migrationStats.petCount} 个宠物，{migrationStats.humanCount} 个人物）
                      ，建议迁移到云端数据库。
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/migrate')}
                  className="bg-gray-900 hover:bg-gray-800 text-white ml-4 rounded-xl"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  立即迁移
                </Button>
              </div>
            </div>
          )}

          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                个人信息
              </TabsTrigger>
              <TabsTrigger value="memorials" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                我的纪念页
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                偏好设置
              </TabsTrigger>
            </TabsList>

            {/* 个人信息标签页 */}
            <TabsContent value="profile">
              <div className="grid lg:grid-cols-2 gap-8">
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

                    <div className="border-t border-gray-100 my-8"></div>

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

                <Card>
                  <CardHeader>
                    <CardTitle>账户统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-light">纪念页总数</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-light">{memorials.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-light">宠物纪念页</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-light">
                          {memorials.filter(m => m.type === 'PET').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-light">逝者纪念页</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-light">
                          {memorials.filter(m => m.type === 'HUMAN').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 我的纪念页标签页 */}
            <TabsContent value="memorials">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-light text-gray-900 mb-2">我的纪念页</h3>
                    <p className="text-gray-600 font-light">管理您创建的纪念页面</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => router.push('/create-obituary')}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      创建宠物纪念
                    </Button>
                    <Button 
                      onClick={() => router.push('/create-person-obituary')}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      创建逝者纪念
                    </Button>
                  </div>
                </div>

                {memorialsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-light">加载中...</p>
                  </div>
                ) : memorials.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 mb-6 font-light">您还没有创建任何纪念页</p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => router.push('/create-obituary')}
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                      >
                        创建宠物纪念
                      </Button>
                      <Button 
                        onClick={() => router.push('/create-person-obituary')}
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                      >
                        创建逝者纪念
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memorials.map((memorial) => (
                      <div key={memorial.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group relative">
                        {/* 卡片内容区域 - 点击进入编辑 */}
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => router.push(`/settings/edit/${memorial.id}`)}
                        >
                          <div className="aspect-video relative mb-6 rounded-xl overflow-hidden bg-gray-100">
                            <img
                              src={getMainImage(memorial)}
                              alt={memorial.subjectName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {/* 编辑提示 */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                                <PenIcon className="w-4 h-4 text-gray-700" />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-light text-gray-900 group-hover:text-gray-700 transition-colors">{memorial.subjectName}</h3>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-light">
                                {memorial.type === 'PET' ? '宠物' : '逝者'}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-light">
                                {memorial.status === 'PUBLISHED' ? '已发布' : memorial.status === 'DRAFT' ? '草稿' : '已归档'}
                              </span>
                            </div>
                          </div>
                          {memorial.subjectType && (
                            <p className="text-sm text-gray-500 font-light mb-4">{memorial.type === 'PET' ? translatePetType(memorial.subjectType) : memorial.subjectType}</p>
                          )}
                          <div className="flex justify-between text-sm text-gray-500">
                            <span className="font-light">浏览 {memorial.viewCount}</span>
                            <span className="font-light">留言 {memorial.messageCount}</span>
                            <span className="font-light">点烛 {memorial.candleCount}</span>
                          </div>
                        </div>

                        {/* 悬浮操作按钮 */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-2">
                            {/* 查看按钮 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const baseUrl = memorial.type === 'PET' ? '/community-pet-obituaries' : '/community-person-obituaries'
                                router.push(`${baseUrl}/${memorial.slug}`)
                              }}
                              className="w-8 h-8 bg-white hover:bg-slate-100 rounded-full shadow-md flex items-center justify-center transition-colors"
                              title="查看纪念页"
                            >
                              <EyeIcon className="w-4 h-4 text-slate-600" />
                            </button>
                            
                            {/* 删除按钮 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMemorial(memorial.id)
                              }}
                              className="w-8 h-8 bg-white hover:bg-red-50 rounded-full shadow-md flex items-center justify-center transition-colors"
                              title="删除纪念页"
                            >
                              <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 偏好设置标签页 */}
            <TabsContent value="preferences">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-light text-gray-900">系统偏好</h2>
                  </div>
                  <p className="text-gray-600 text-sm font-light">
                    选择您偏好的纪念系统，系统会自动记住您的选择
                  </p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        当前偏好系统
                      </label>
                      <div className="flex items-center gap-2 mb-4">
                        {(() => {
                          const preferred = getPreferredSystemText()
                          const IconComponent = preferred.system === 'pet' ? Heart : 
                                              preferred.system === 'human' ? Users : SettingsIcon
                          const bgColor = preferred.system === 'pet' ? 'bg-teal-100 text-teal-700' :
                                         preferred.system === 'human' ? 'bg-purple-100 text-purple-700' :
                                         'bg-gray-100 text-gray-500'
                          
                          return (
                            <span className={`inline-flex items-center px-3 py-1 ${bgColor} rounded-full text-sm font-light`}>
                              <IconComponent className="w-3 h-3 mr-1" />
                              {preferred.text}
                              {preferred.auto && !user?.preferredSystem && (
                                <span className="ml-1 text-xs opacity-70">(智能推荐)</span>
                              )}
                            </span>
                          )
                        })()}
                      </div>
                      <p className="text-sm text-gray-600 font-light">
                        {user?.preferredSystem ? 
                          '下次访问网站时会自动进入您偏好的系统' :
                          '系统基于您的纪念页类型智能推荐，您可以在下方手动设置偏好'
                        }
                      </p>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        选择偏好系统
                      </label>
                      <p className="text-sm text-gray-500 font-light mb-4">
                        点击下方选项设置偏好并直接进入对应系统
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleSystemChange('pet')}
                          className={`w-full p-6 rounded-xl border transition-all text-left hover:shadow-md ${
                            user.preferredSystem === 'pet' || (!user.preferredSystem && getPreferredSystemText().system === 'pet')
                              ? 'border-teal-300 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-light text-gray-900 text-lg">宠物纪念系统</h3>
                                <p className="text-sm text-gray-600 font-light">为心爱的宠物创建纪念页面</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>

                        <button
                          onClick={() => handleSystemChange('human')}
                          className={`w-full p-6 rounded-xl border transition-all text-left hover:shadow-md ${
                            user.preferredSystem === 'human' || (!user.preferredSystem && getPreferredSystemText().system === 'human')
                              ? 'border-purple-300 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-light text-gray-900 text-lg">人类纪念系统</h3>
                                <p className="text-sm text-gray-600 font-light">为逝去的亲人朋友创建纪念页面</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 通知设置 */}
                  <div className="space-y-4">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-light text-gray-900">通知设置</h2>
                      </div>
                      <p className="text-gray-600 text-sm font-light">
                        管理您的邮件通知偏好
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">邮件通知</h3>
                            <p className="text-sm text-gray-600 font-light leading-relaxed">
                              当有人在您的纪念页留言时，我们会通过邮件通知您
                            </p>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>• 新留言通知：收到温暖的留言时第一时间知晓</p>
                              <p>• 隐私保护：您的邮箱地址不会被公开</p>
                              <p>• 随时管理：可随时在此页面开启或关闭通知</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-light ${emailNotificationEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {emailNotificationEnabled ? '已开启' : '已关闭'}
                          </span>
                          <Button
                            variant={emailNotificationEnabled ? "default" : "outline"}
                            onClick={() => handleEmailNotificationChange(!emailNotificationEnabled)}
                            className={`px-6 py-2 rounded-xl text-sm font-light ${
                              emailNotificationEnabled 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {emailNotificationEnabled ? '关闭通知' : '开启通知'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-xl font-light"
                      onClick={logout}
                    >
                      退出登录
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SettingsForm />
    </Suspense>
  )
}