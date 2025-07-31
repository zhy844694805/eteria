"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Shield, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Mail,
  ArrowLeft,
  UserX,
  UserCheck,
  Crown,
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  isBanned: boolean
  banReason?: string
  banExpiresAt?: string
  emailVerified: boolean
  preferredSystem?: 'PET' | 'HUMAN'
  createdAt: string
  lastLoginAt: string
  _count: {
    memorials: number
    messages: number
    candles: number
  }
}

interface BanUserData {
  userId: string
  reason: string
  duration: string // 'permanent' | '1d' | '7d' | '30d'
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [banData, setBanData] = useState<BanUserData>({
    userId: '',
    reason: '',
    duration: '7d'
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role || '')) {
      router.push('/admin')
      return
    }
    
    loadUsers()
  }, [user, router, currentPage, searchQuery, statusFilter, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
        status: statusFilter,
        role: roleFilter
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('获取用户列表失败')
      
      const data = await response.json()
      setUsers(data.users)
      setTotalPages(Math.ceil(data.total / 20))
    } catch (error) {
      console.error('加载用户列表失败:', error)
      setMessage({ type: 'error', text: '加载用户列表失败' })
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!banData.reason.trim()) {
      setMessage({ type: 'error', text: '请输入封禁原因' })
      return
    }

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banData)
      })

      if (!response.ok) throw new Error('封禁用户失败')

      setMessage({ type: 'success', text: '用户已被封禁' })
      setShowBanDialog(false)
      setBanData({ userId: '', reason: '', duration: '7d' })
      loadUsers()
    } catch (error) {
      console.error('封禁用户失败:', error)
      setMessage({ type: 'error', text: '封禁用户失败' })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) throw new Error('解封用户失败')

      setMessage({ type: 'success', text: '用户已解封' })
      loadUsers()
    } catch (error) {
      console.error('解封用户失败:', error)
      setMessage({ type: 'error', text: '解封用户失败' })
    }
  }

  const handleActivateUser = async (userId: string, activate: boolean) => {
    try {
      const response = await fetch('/api/admin/users/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activate })
      })

      if (!response.ok) throw new Error(`${activate ? '激活' : '禁用'}用户失败`)

      setMessage({ type: 'success', text: `用户已${activate ? '激活' : '禁用'}` })
      loadUsers()
    } catch (error) {
      console.error('修改用户状态失败:', error)
      setMessage({ type: 'error', text: `${activate ? '激活' : '禁用'}用户失败` })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'SUPER_ADMIN': { label: '超级管理员', color: 'bg-red-100 text-red-800 border-red-200' },
      'ADMIN': { label: '管理员', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      'MODERATOR': { label: '版主', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'USER': { label: '普通用户', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge variant="destructive">已封禁</Badge>
    }
    if (!user.isActive) {
      return <Badge variant="outline">已禁用</Badge>
    }
    if (!user.emailVerified) {
      return <Badge variant="secondary">未验证</Badge>
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">正常</Badge>
  }

  if (!user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role || '')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回管理后台
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">用户管理</h1>
                <p className="text-sm text-gray-600">管理网站用户账户和权限</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 消息提示 */}
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* 搜索和筛选 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                搜索和筛选
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索用户名或邮箱"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="用户状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="active">正常用户</SelectItem>
                    <SelectItem value="banned">被封禁</SelectItem>
                    <SelectItem value="inactive">已禁用</SelectItem>
                    <SelectItem value="unverified">未验证邮箱</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="用户角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="USER">普通用户</SelectItem>
                    <SelectItem value="MODERATOR">版主</SelectItem>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                    <SelectItem value="SUPER_ADMIN">超级管理员</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 用户列表 */}
          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>
                共 {users.length} 个用户
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户信息</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>活动统计</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>纪念页: {user._count.memorials}</div>
                              <div>留言: {user._count.messages}</div>
                              <div>点烛: {user._count.candles}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(user.lastLoginAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {user.isBanned ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setBanData({ ...banData, userId: user.id })
                                    setShowBanDialog(true)
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActivateUser(user.id, !user.isActive)}
                                className={user.isActive ? 'text-yellow-600' : 'text-green-600'}
                              >
                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                上一页
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 封禁用户对话框 */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>封禁用户</DialogTitle>
            <DialogDescription>
              请输入封禁原因和持续时间
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封禁原因
              </label>
              <Textarea
                placeholder="请输入封禁原因..."
                value={banData.reason}
                onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封禁时长
              </label>
              <Select value={banData.duration} onValueChange={(value) => setBanData({ ...banData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 天</SelectItem>
                  <SelectItem value="7d">7 天</SelectItem>
                  <SelectItem value="30d">30 天</SelectItem>
                  <SelectItem value="permanent">永久封禁</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBanUser} className="bg-red-600 hover:bg-red-700">
              确认封禁
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}