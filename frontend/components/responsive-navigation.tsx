"use client"

import Link from "next/link"
import { Heart, User, LogOut, Settings, Menu, X, Home, Plus, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface NavigationProps {
  currentPage?: "home" | "human-memorial" | "create" | "community" | "pricing" | "donate" | "digital-life" | "about"
}

export function ResponsiveNavigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()
  const { user, logout, autoDetectAndSetPreferredSystem } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 检查是否在逝者纪念系统中
  const isHumanMemorialSystem = pathname.startsWith('/human-memorial') || 
                                pathname.startsWith('/create-person-obituary') || 
                                pathname.startsWith('/community-person-obituaries')
  
  // 检查是否在数字生命系统中  
  const isDigitalLifeSystem = pathname.startsWith('/digital-life')
  
  // 检查是否在任何纪念系统中
  const isInMemorialSystem = isHumanMemorialSystem
  
  // 检查是否在主页（现在就是human-memorial）
  const isMainHomepage = pathname === '/human-memorial'

  // 自动检测用户偏好系统
  useEffect(() => {
    if (user && isHumanMemorialSystem) {
      autoDetectAndSetPreferredSystem(pathname)
    }
  }, [user, pathname, isHumanMemorialSystem, autoDetectAndSetPreferredSystem])
  
  // 关闭移动菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // 切换移动菜单
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // 获取主页链接
  const getHomeLink = () => {
    if (pathname.startsWith('/digital-life')) return "/digital-life"
    if (isDigitalLifeSystem) return "/digital-life-home"
    // 所有其他情况都跳转到 human-memorial（现在是主页）
    return "/human-memorial"
  }

  // 获取导航项目 - 使用传入的currentPage参数而不是pathname检测
  const getNavItems = () => {
    // 使用传入的currentPage参数来决定导航，避免SSR不匹配
    if (currentPage === "digital-life") {
      return [
        { href: "/digital-life-home", label: "数字生命", icon: Heart },
        { href: "/digital-life", label: "创建数字生命", icon: Plus },
        { href: "/human-memorial", label: "逝者纪念", icon: Users },
      ]
    }
    
    // 默认显示人员纪念系统导航（包括主页）
    return [
      { href: "/human-memorial", label: "逝者纪念", icon: Heart },
      { href: "/create-person-obituary", label: "创建纪念", icon: Plus },
      { href: "/community-person-obituaries", label: "纪念社区", icon: Users },
      { href: "/digital-life-home", label: "数字生命", icon: Sparkles, isDigitalLife: true },
    ]
  }

  const navItems = getNavItems()

  return (
    <>
      {/* 桌面端导航 - 保持原有设计 */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass-effect floating-nav rounded-full px-8 py-4 border border-white/20 hidden lg:block">
        <nav className="flex items-center justify-between space-x-8">
          {/* Logo */}
          <Link href={getHomeLink()} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-slate-800">永念</span>
          </Link>
          
          {/* 导航项目 */}
          {navItems.length > 0 && (
            <div className="flex items-center space-x-6 text-sm">
              {navItems.map((item) => {
                const isDigitalLife = (item as any).isDigitalLife
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "transition-colors relative",
                      isDigitalLife 
                        ? "text-purple-600 hover:text-purple-800 font-medium" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                    {isDigitalLife && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                  </Link>
                )
              })}
              
              {/* 用户状态管理 */}
              <div className="w-px h-4 bg-slate-300"></div>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <User className="w-3 h-3" />
                    <span>{user.name}</span>
                  </div>
                  <Link href="/settings">
                    <button className="w-10 h-10 sm:w-8 sm:h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors touch-manipulation">
                      <Settings className="w-4 h-4 text-slate-600" />
                    </button>
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-slate-500 hover:text-slate-700 transition-colors text-xs min-w-[44px] min-h-[44px] sm:min-w-[auto] sm:min-h-[auto] flex items-center justify-center touch-manipulation"
                  >
                    <LogOut className="w-4 h-4 sm:w-3 sm:h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <button className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full text-xs hover:border-slate-400 transition-colors">
                      登录
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-full text-xs hover:bg-slate-900 transition-colors">
                      注册
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* 移动端导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href={getHomeLink()} className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-slate-800">永念</span>
          </Link>
          
          {/* 移动端菜单按钮 */}
          <button
            onClick={toggleMobileMenu}
            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
        
        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {/* 导航项目 */}
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isDigitalLife = (item as any).isDigitalLife
                const isLastItem = index === navItems.length - 1
                
                return (
                  <div key={item.href}>
                    {/* 数字生命前的分隔线 */}
                    {isDigitalLife && (
                      <div className="border-t border-slate-200 my-2"></div>
                    )}
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                        pathname === item.href 
                          ? "bg-slate-100 text-slate-900" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        isDigitalLife && "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                      )}
                      onClick={closeMobileMenu}
                    >
                      <Icon className={cn("w-5 h-5", isDigitalLife && "text-purple-600")} />
                      <span className="font-medium">{item.label}</span>
                      {isDigitalLife && (
                        <span className="ml-auto text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                          NEW
                        </span>
                      )}
                    </Link>
                  </div>
                )
              })}
              
              
              {/* 用户状态 */}
              <div className="border-t border-slate-200 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">设置</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout()
                          closeMobileMenu()
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">退出登录</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* 移动端遮罩层 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}