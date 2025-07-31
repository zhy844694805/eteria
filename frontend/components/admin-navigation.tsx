"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Shield, 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  User,
  AlertTriangle,
  Eye,
  Crown
} from 'lucide-react'

interface AdminNavigationProps {
  className?: string
}

const navigationItems = [
  {
    title: '仪表板',
    href: '/admin',
    icon: Home,
    description: '系统概览和统计'
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
    description: '管理用户账户',
    submenu: [
      { title: '所有用户', href: '/admin/users' },
      { title: '被封禁用户', href: '/admin/users/banned' },
      { title: '用户举报', href: '/admin/users/reports' }
    ]
  },
  {
    title: '内容审核',
    href: '/admin/content',
    icon: FileText,
    description: '审核纪念页面和留言',
    submenu: [
      { title: '待审核内容', href: '/admin/content/pending' },
      { title: '纪念页管理', href: '/admin/content/memorials' },
      { title: '留言管理', href: '/admin/content/messages' }
    ]
  },
  {
    title: '数据分析',
    href: '/admin/analytics',
    icon: BarChart3,
    description: '网站使用数据分析'
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings,
    description: '网站配置管理',
    submenu: [
      { title: '基本设置', href: '/admin/settings/general' },
      { title: '邮件设置', href: '/admin/settings/email' },
      { title: '安全设置', href: '/admin/settings/security' }
    ]
  }
]

export function AdminNavigation({ className }: AdminNavigationProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      'SUPER_ADMIN': { label: '超级管理员', color: 'bg-red-100 text-red-800' },
      'ADMIN': { label: '管理员', color: 'bg-purple-100 text-purple-800' },
      'MODERATOR': { label: '版主', color: 'bg-blue-100 text-blue-800' }
    }
    
    if (!role || !roleConfig[role as keyof typeof roleConfig]) {
      return null
    }
    
    const config = roleConfig[role as keyof typeof roleConfig]
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const NavigationContent = () => (
    <div className="space-y-6">
      {/* 管理员信息 */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-800">{user?.name}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {getRoleBadge(user?.role)}
          <Link href="/" className="text-sm text-purple-600 hover:text-purple-700">
            返回网站
          </Link>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.href)
          
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
              
              {/* 子菜单 */}
              {item.submenu && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                        pathname === subItem.href
                          ? 'bg-purple-50 text-purple-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 底部操作 */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 ${className}`}>
        <div className="flex-1 p-6 overflow-y-auto">
          <NavigationContent />
        </div>
      </aside>

      {/* 移动端顶部导航 */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">管理后台</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getRoleBadge(user?.role)}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    管理后台
                  </SheetTitle>
                  <SheetDescription>
                    永念纪念网站管理系统
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <NavigationContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  )
}

// 管理员页面布局组件
interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user } = useAuth()

  // 权限检查
  if (!user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">访问被拒绝</h2>
          <p className="text-gray-600 mb-4">您没有访问管理后台的权限</p>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {title && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}