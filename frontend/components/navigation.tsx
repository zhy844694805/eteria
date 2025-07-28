"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface NavigationProps {
  currentPage?: "home" | "pet-memorial" | "human-memorial" | "create" | "community" | "pricing" | "donate"
}

export function Navigation({ currentPage }: NavigationProps) {
  const pathname = usePathname()
  
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
            
            {/* 返回总首页的链接 */}
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm border-l border-gray-300 pl-4"
            >
              ← 返回总首页
            </Link>
          </div>
        )}
        
        {/* 逗者纪念系统导航 */}
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
            
            {/* 返回总首页的链接 */}
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm border-l border-gray-300 pl-4"
            >
              ← 返回总首页
            </Link>
          </div>
        )}
        
        {/* 总首页不显示任何导航菜单，只显示logo */}
      </nav>
    </header>
  )
}