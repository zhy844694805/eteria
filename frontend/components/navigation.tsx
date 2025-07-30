"use client"

import Link from "next/link"
import { Heart, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface NavigationProps {
  currentPage?: "home" | "pet-memorial" | "human-memorial" | "create" | "community" | "pricing" | "donate"
}

export function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // 检查是否在宠物纪念系统中
  const isPetMemorialSystem = pathname.startsWith('/pet-memorial') || 
                              pathname.startsWith('/create-obituary') || 
                              pathname.startsWith('/community-pet-obituaries')
  
  // 检查是否在逗者纪念系统中
  const isHumanMemorialSystem = pathname.startsWith('/human-memorial') || 
                                pathname.startsWith('/create-person-obituary') || 
                                pathname.startsWith('/community-person-obituaries')
  
  // 检查是否在任何纪念系统中
  const isInMemorialSystem = isPetMemorialSystem || isHumanMemorialSystem
  
  // 检查是否在总首页
  const isMainHomepage = pathname === '/'
  
  return (
    <header className="px-4 py-6 bg-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo - 根据所在系统决定链接目标 */}
        <Link href={
          isPetMemorialSystem ? "/pet-memorial" : 
          isHumanMemorialSystem ? "/human-memorial" : 
          "/"
        } className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800">永念</span>
        </Link>
        
        {/* 导航菜单 - 根据系统显示不同内容 */}
        {isPetMemorialSystem && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pet-memorial"
              className={`hover:text-gray-800 ${currentPage === "pet-memorial" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              首页
            </Link>
            <Link
              href="/create-obituary"
              className={`hover:text-gray-800 ${currentPage === "create" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              创建悼念页
            </Link>
            <Link
              href="/community-pet-obituaries"
              className={`hover:text-gray-800 ${currentPage === "community" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              社区悼念页
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-gray-800 ${currentPage === "pricing" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              价格
            </Link>
            <Link href="/donate">
              <Button
                className={`${
                  currentPage === "donate" ? "bg-pink-600 hover:bg-pink-700" : "bg-pink-500 hover:bg-pink-600"
                } text-white`}
              >
                <Heart className="w-4 h-4 mr-2" />
                捐赠
              </Button>
            </Link>
            
            {/* 用户设置或登录注册按钮 */}
            {user ? (
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700 text-sm border-l border-gray-300 pl-4 flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                用户设置
              </Link>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  主页
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white text-xs">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* 逝者纪念系统导航 */}
        {isHumanMemorialSystem && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/human-memorial"
              className={`hover:text-gray-800 ${currentPage === "human-memorial" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              首页
            </Link>
            <Link
              href="/create-person-obituary"
              className={`hover:text-gray-800 ${currentPage === "create" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              创建纪念页
            </Link>
            <Link
              href="/community-person-obituaries"
              className={`hover:text-gray-800 ${currentPage === "community" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              社区纪念页
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-gray-800 ${currentPage === "pricing" ? "text-gray-800 font-medium" : "text-gray-600"}`}
            >
              价格
            </Link>
            <Link href="/donate">
              <Button
                className={`${
                  currentPage === "donate" ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"
                } text-white`}
              >
                <Heart className="w-4 h-4 mr-2" />
                捐赠
              </Button>
            </Link>
            
            {/* 用户设置或登录注册按钮 */}
            {user ? (
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700 text-sm border-l border-gray-300 pl-4 flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                用户设置
              </Link>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  主页
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white text-xs">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* 总首页或认证页面显示用户状态 */}
        {(isMainHomepage || pathname.startsWith('/login') || pathname.startsWith('/register')) && (
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>欢迎，{user.name}</span>
                </div>
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    用户设置
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  退出
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}