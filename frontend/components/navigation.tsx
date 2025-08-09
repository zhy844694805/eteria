"use client"

import Link from "next/link"
import { Heart, User, LogOut, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

interface NavigationProps {
  currentPage?: "home" | "pet-memorial" | "human-memorial" | "create" | "community" | "digital-life" | "pricing" | "donate"
}

export function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()
  const { user, logout, autoDetectAndSetPreferredSystem } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 检查是否在宠物纪念系统中
  const isPetMemorialSystem = pathname.startsWith('/pet-memorial') || 
                              pathname.startsWith('/create-obituary') || 
                              pathname.startsWith('/community-pet-obituaries')
  
  // 检查是否在逗者纪念系统中
  const isHumanMemorialSystem = pathname.startsWith('/human-memorial') || 
                                pathname.startsWith('/create-person-obituary') || 
                                pathname.startsWith('/community-person-obituaries') ||
                                pathname.startsWith('/voice-cloning')
  
  // 检查是否在数字生命系统中
  const isDigitalLifeSystem = pathname.startsWith('/digital-life')
  
  // 检查是否在任何纪念系统中
  const isInMemorialSystem = isPetMemorialSystem || isHumanMemorialSystem || isDigitalLifeSystem
  
  // 检查是否在总首页
  const isMainHomepage = pathname === '/'

  // 自动检测用户偏好系统
  useEffect(() => {
    if (user && (isPetMemorialSystem || isHumanMemorialSystem)) {
      autoDetectAndSetPreferredSystem(pathname)
    }
  }, [user, pathname, isPetMemorialSystem, isHumanMemorialSystem, autoDetectAndSetPreferredSystem])
  
  // 关闭移动菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* 桌面端导航 */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass-effect floating-nav rounded-full px-8 py-4 border border-white/20 hidden lg:block">
        <nav className="flex items-center justify-between space-x-8">
        {/* Logo - 极简化设计 */}
        <Link href={
          isPetMemorialSystem ? "/pet-memorial" : 
          isHumanMemorialSystem ? "/human-memorial" : 
          "/"
        } className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-medium text-slate-800">永念</span>
        </Link>
        
        {/* 宠物纪念系统导航 - 极简化样式 */}
        {isPetMemorialSystem && (
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/pet-memorial"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              宠物纪念
            </Link>
            <Link
              href="/create-obituary"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              创建
            </Link>
            <Link
              href="/community-pet-obituaries"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              社区
            </Link>
            
            {/* 用户状态管理 - 始终显示 */}
            <div className="w-px h-4 bg-slate-300"></div>
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              主页
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <User className="w-3 h-3" />
                  <span>{user.name}</span>
                </div>
                <Link href="/settings">
                  <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </button>
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4" />
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
        
        {/* 逝者纪念系统导航 - 极简化样式 */}
        {isHumanMemorialSystem && (
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/human-memorial"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              逝者纪念
            </Link>
            <Link
              href="/create-person-obituary"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              创建
            </Link>
            <Link
              href="/community-person-obituaries"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              社区
            </Link>
            <Link
              href="/digital-life-home"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              数字生命
            </Link>
            
            {/* 用户状态管理 - 始终显示 */}
            <div className="w-px h-4 bg-slate-300"></div>
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              主页
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <User className="w-3 h-3" />
                  <span>{user.name}</span>
                </div>
                <Link href="/settings">
                  <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </button>
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4" />
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
        
        {/* 数字生命系统导航 */}
        {isDigitalLifeSystem && (
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/human-memorial"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              逝者纪念
            </Link>
            <Link
              href="/create-person-obituary"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              创建
            </Link>
            <Link
              href="/community-person-obituaries"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              社区
            </Link>
            <Link
              href="/digital-life-home"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              数字生命
            </Link>
            
            {/* 用户状态管理 - 始终显示 */}
            <div className="w-px h-4 bg-slate-300"></div>
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              主页
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <User className="w-3 h-3" />
                  <span>{user.name}</span>
                </div>
                <Link href="/settings">
                  <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </button>
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4" />
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
        
        {/* 总首页显示用户状态 - 极简风格 */}
        {(isMainHomepage || pathname.startsWith('/login') || pathname.startsWith('/register')) && (
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <User className="w-3 h-3" />
                  <span>{user.name}</span>
                </div>
                <Link href="/settings">
                  <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </button>
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4" />
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
    </>
  )
}