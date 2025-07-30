"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { migrationService } from '@/lib/migration-service'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  PlusIcon
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

export default function SettingsPage() {
  const { user, logout, updatePreferredSystem, updateUserInfo } = useAuth()
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

  // 如果用户未登录，重定向到登录页
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // 检查是否有数据需要迁移
  useEffect(() => {
    const hasData = migrationService.hasDataToMigrate()
    const stats = migrationService.getMigrationStats()
    
    setHasDataToMigrate(hasData)
    setMigrationStats(stats)
    
    // 获取用户纪念页
    if (user) {
      fetchMemorials()
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
    return <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到登录页面...</p>
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
        text: `已切换到${system === 'pet' ? '宠物' : '人类'}纪念系统` 
      })
      
      // 延迟跳转到对应系统
      setTimeout(() => {
        const redirectPath = system === 'pet' ? '/pet-memorial' : '/human-memorial'
        router.push(redirectPath)
      }, 1500)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '切换系统失败，请重试' 
      })
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

          {/* Data Migration Alert */}
          {hasDataToMigrate && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Database className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800 mb-1">发现本地数据</p>
                  <p className="text-blue-700 text-sm">
                    找到 {migrationStats.totalCount} 个本地纪念页（
                    {migrationStats.petCount} 个宠物，{migrationStats.humanCount} 个人物）
                    ，建议迁移到云端数据库以便多设备同步。
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/migrate')}
                  className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  立即迁移
                </Button>
              </AlertDescription>
            </Alert>
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

                <Card>
                  <CardHeader>
                    <CardTitle>账户统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">纪念页总数</span>
                        <Badge variant="outline">{memorials.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">宠物纪念页</span>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700">
                          {memorials.filter(m => m.type === 'PET').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">逝者纪念页</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {memorials.filter(m => m.type === 'HUMAN').length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 我的纪念页标签页 */}
            <TabsContent value="memorials">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">我的纪念页</h3>
                    <p className="text-gray-600">管理您创建的纪念页面</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => router.push('/create-obituary')}
                      className="bg-teal-400 hover:bg-teal-500 text-white"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      创建宠物纪念
                    </Button>
                    <Button 
                      onClick={() => router.push('/create-person-obituary')}
                      className="bg-purple-400 hover:bg-purple-500 text-white"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      创建逝者纪念
                    </Button>
                  </div>
                </div>

                {memorialsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : memorials.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 mb-4">您还没有创建任何纪念页</p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => router.push('/create-obituary')}
                          className="bg-teal-400 hover:bg-teal-500 text-white"
                        >
                          创建宠物纪念
                        </Button>
                        <Button 
                          onClick={() => router.push('/create-person-obituary')}
                          className="bg-purple-400 hover:bg-purple-500 text-white"
                        >
                          创建逝者纪念
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memorials.map((memorial) => (
                      <Card key={memorial.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={getMainImage(memorial)}
                              alt={memorial.subjectName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{memorial.subjectName}</CardTitle>
                            <div className="flex gap-2">
                              {getTypeBadge(memorial.type)}
                              {getStatusBadge(memorial.status)}
                            </div>
                          </div>
                          <CardDescription>
                            {memorial.subjectType && (
                              <span className="text-sm text-gray-500">{memorial.subjectType}</span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-500 mb-4">
                            <span>浏览 {memorial.viewCount}</span>
                            <span>留言 {memorial.messageCount}</span>
                            <span>点烛 {memorial.candleCount}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const baseUrl = memorial.type === 'PET' ? '/community-pet-obituaries' : '/community-person-obituaries'
                                router.push(`${baseUrl}/${memorial.slug}`)
                              }}
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/settings/edit/${memorial.id}`)}
                            >
                              <PenIcon className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMemorial(memorial.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              删除
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 偏好设置标签页 */}
            <TabsContent value="preferences">
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
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}