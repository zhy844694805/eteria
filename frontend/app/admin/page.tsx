"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  FileText, 
  Image, 
  MessageSquare, 
  Flame,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Settings,
  BarChart3,
  Eye,
  Ban,
  Trash2,
  UserCheck
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    active: number
    banned: number
    newToday: number
    newThisWeek: number
  }
  memorials: {
    total: number
    published: number
    pending: number
    pet: number
    human: number
    newToday: number
  }
  content: {
    messages: number
    candles: number
    likes: number
    images: number
  }
  reviews: {
    pending: number
    approved: number
    rejected: number
  }
}

interface RecentActivity {
  id: string
  type: 'USER_REGISTER' | 'MEMORIAL_CREATE' | 'MESSAGE_POST' | 'CONTENT_REPORT'
  user: {
    name: string
    email: string
  }
  description: string
  createdAt: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 检查管理员权限
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 检查用户是否有管理员权限
    if (!user.role || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/')
      return
    }

    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // 并行加载统计数据和最近活动
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-activity')
      ])

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error('获取数据失败')
      }

      const [statsData, activityData] = await Promise.all([
        statsResponse.json(),
        activityResponse.json()
      ])

      setStats(statsData)
      setRecentActivity(activityData.activities)
    } catch (error) {
      console.error('加载仪表板数据失败:', error)
      setError('加载数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTER':
        return <UserCheck className="w-4 h-4 text-green-500" />
      case 'MEMORIAL_CREATE':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'MESSAGE_POST':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case 'CONTENT_REPORT':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  if (!user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">访问被拒绝</h2>
            <p className="text-gray-600 text-sm mb-4">您没有访问管理后台的权限</p>
            <Button onClick={() => router.push('/')} variant="outline">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
                <p className="text-sm text-gray-600">永念纪念网站管理系统</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {user.role === 'SUPER_ADMIN' ? '超级管理员' : 
                 user.role === 'ADMIN' ? '管理员' : '版主'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
              >
                返回网站
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 错误提示 */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    今日新增 {stats.users.newToday} 人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">纪念页面</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.memorials.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    今日新增 {stats.memorials.newToday} 个
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">待审核内容</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reviews.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    需要人工审核
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">社区互动</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.content.messages + stats.content.candles + stats.content.likes).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    留言·点烛·点赞
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 主要内容区域 */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="users">用户管理</TabsTrigger>
              <TabsTrigger value="content">内容审核</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
              <TabsTrigger value="settings">系统设置</TabsTrigger>
            </TabsList>

            {/* 概览标签页 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最近活动 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      最近活动
                    </CardTitle>
                    <CardDescription>
                      网站最近的用户活动和内容更新
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.slice(0, 8).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {activity.user.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 系统状态 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      系统状态
                    </CardTitle>
                    <CardDescription>
                      当前系统的运行状态和关键指标
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">活跃用户</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{stats.users.active}</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">被封禁用户</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{stats.users.banned}</span>
                            <Ban className="w-4 h-4 text-red-500" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">已发布纪念页</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{stats.memorials.published}</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">待审核内容</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{stats.reviews.pending}</span>
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-teal-600">
                                {stats.memorials.pet}
                              </div>
                              <div className="text-xs text-gray-500">宠物纪念</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-purple-600">
                                {stats.memorials.human}
                              </div>
                              <div className="text-xs text-gray-500">逝者纪念</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 快捷操作区域 */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>用户管理</CardTitle>
                  <CardDescription>
                    管理网站用户账户和权限
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/users')}
                    >
                      <Users className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">查看所有用户</div>
                        <div className="text-sm text-muted-foreground">
                          用户列表和详细信息
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/users/banned')}
                    >
                      <Ban className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">被封禁用户</div>
                        <div className="text-sm text-muted-foreground">
                          管理被封禁的用户账号
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/users/reports')}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">用户举报</div>
                        <div className="text-sm text-muted-foreground">
                          处理用户举报和投诉
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 内容审核 */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>内容审核</CardTitle>
                  <CardDescription>
                    审核用户提交的纪念页面、留言和图片
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/content/pending')}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">待审核内容</div>
                        <div className="text-sm text-muted-foreground">
                          {stats?.reviews.pending || 0} 个待处理项目
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/content/memorials')}
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">纪念页管理</div>
                        <div className="text-sm text-muted-foreground">
                          审核和管理纪念页面
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/content/messages')}
                    >
                      <MessageSquare className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">留言管理</div>
                        <div className="text-sm text-muted-foreground">
                          审核用户留言和评论
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 数据分析 */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>数据分析</CardTitle>
                  <CardDescription>
                    网站使用情况和用户行为分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">数据分析功能正在开发中</p>
                    <p className="text-sm text-gray-400">
                      即将提供详细的用户活跃度、内容统计和趋势分析
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 系统设置 */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>系统设置</CardTitle>
                  <CardDescription>
                    管理网站配置和系统参数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/settings/general')}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">基本设置</div>
                        <div className="text-sm text-muted-foreground">
                          网站标题、描述等基础配置
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/admin/settings/email')}
                    >
                      <MessageSquare className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">邮件设置</div>
                        <div className="text-sm text-muted-foreground">
                          SMTP配置和邮件模板
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}