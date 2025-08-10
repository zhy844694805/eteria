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
  
  // 检查是否在逝者纪念系统中
  const isHumanMemorialSystem = pathname.startsWith('/human-memorial') || 
                                pathname.startsWith('/create-person-obituary') || 
                                pathname.startsWith('/community-person-obituaries') ||
                                pathname.startsWith('/voice-cloning')
  
  // 检查是否在数字生命系统中
  const isDigitalLifeSystem = pathname.startsWith('/digital-life')
  
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

  // 渲染用户状态组件 - 简化版本，总是显示登录注册
  const renderUserSection = () => {
    return (
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
    )
  }

  return (
    <>
      {/* 桌面端导航 */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass-effect floating-nav rounded-full px-8 py-4 border border-white/20 hidden lg:block">
        <nav className="flex items-center justify-between space-x-8">
          {/* Logo */}
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
          
          {/* 右侧菜单区域 - 简化逻辑，总是显示 */}
          <div className="flex items-center space-x-6 text-sm">
            {/* 根据页面显示不同菜单，但总是显示用户按钮 */}
            {isMainHomepage ? (
              /* 主页菜单 */
              <>
                <Link href="/pet-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  宠物纪念
                </Link>
                <Link href="/human-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  逝者纪念
                </Link>
                <Link href="/digital-life-home" className="text-slate-600 hover:text-slate-900 transition-colors">
                  数字生命
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
              </>
            ) : isPetMemorialSystem ? (
              /* 宠物纪念系统菜单 */
              <>
                <Link href="/pet-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  宠物纪念
                </Link>
                <Link href="/create-obituary" className="text-slate-600 hover:text-slate-900 transition-colors">
                  创建
                </Link>
                <Link href="/community-pet-obituaries" className="text-slate-600 hover:text-slate-900 transition-colors">
                  社区
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  主页
                </Link>
              </>
            ) : isHumanMemorialSystem ? (
              /* 逝者纪念系统菜单 */
              <>
                <Link href="/human-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  逝者纪念
                </Link>
                <Link href="/create-person-obituary" className="text-slate-600 hover:text-slate-900 transition-colors">
                  创建
                </Link>
                <Link href="/community-person-obituaries" className="text-slate-600 hover:text-slate-900 transition-colors">
                  社区
                </Link>
                <Link href="/digital-life-home" className="text-slate-600 hover:text-slate-900 transition-colors">
                  数字生命
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  主页
                </Link>
              </>
            ) : isDigitalLifeSystem ? (
              /* 数字生命系统菜单 */
              <>
                <Link href="/human-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  逝者纪念
                </Link>
                <Link href="/create-person-obituary" className="text-slate-600 hover:text-slate-900 transition-colors">
                  创建
                </Link>
                <Link href="/community-person-obituaries" className="text-slate-600 hover:text-slate-900 transition-colors">
                  社区
                </Link>
                <Link href="/digital-life-home" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  数字生命
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                  主页
                </Link>
              </>
            ) : (
              /* 默认菜单（登录注册页面等） */
              <>
                <Link href="/pet-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  宠物纪念
                </Link>
                <Link href="/human-memorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                  逝者纪念
                </Link>
                <Link href="/digital-life-home" className="text-slate-600 hover:text-slate-900 transition-colors">
                  数字生命
                </Link>
                <div className="w-px h-4 bg-slate-300"></div>
              </>
            )}
            
            {/* 用户状态区域 - 总是显示 */}
            {renderUserSection()}
          </div>
        </nav>
      </header>

      {/* 移动端导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 lg:hidden">
        <nav className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href={
            isPetMemorialSystem ? "/pet-memorial" : 
            isHumanMemorialSystem ? "/human-memorial" : 
            "/"
          } className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-800 rounded flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-base font-medium text-slate-800">永念</span>
          </Link>

          {/* 移动端菜单按钮和用户状态 */}
          <div className="flex items-center space-x-3">
            {/* 用户状态 - 简化显示 */}
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <button className="border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-xs hover:border-slate-400 transition-colors">
                  登录
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs hover:bg-slate-900 transition-colors">
                  注册
                </button>
              </Link>
            </div>

            {/* 菜单按钮 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* 移动端下拉菜单 */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {/* 总首页链接 */}
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
              >
                总首页
              </Link>

              {/* 宠物纪念系统菜单 - 总是显示在主页和宠物系统中 */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 px-3 py-1">宠物纪念</div>
                <Link
                  href="/pet-memorial"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  宠物纪念首页
                </Link>
                <Link
                  href="/create-obituary"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  创建宠物纪念
                </Link>
                <Link
                  href="/community-pet-obituaries"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  宠物纪念社区
                </Link>
              </div>

              {/* 逝者纪念系统菜单 - 总是显示 */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 px-3 py-1">逝者纪念</div>
                <Link
                  href="/human-memorial"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  逝者纪念首页
                </Link>
                <Link
                  href="/create-person-obituary"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  创建逝者纪念
                </Link>
                <Link
                  href="/community-person-obituaries"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  逝者纪念社区
                </Link>
                <Link
                  href="/digital-life-home"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  数字生命
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}