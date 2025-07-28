import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentPage?: "home" | "create" | "community" | "pricing" | "donate"
}

export function Navigation({ currentPage }: NavigationProps) {
  return (
    <header className="px-4 py-6 bg-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800">永念</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`hover:text-gray-800 ${currentPage === "home" ? "text-gray-800 font-medium" : "text-gray-600"}`}
          >
            首页
          </Link>
          <Link
            href="/create-obituary"
            className={`hover:text-gray-800 ${currentPage === "create" ? "text-gray-800 font-medium" : "text-gray-600"}`}
          >
            创建免费宠物悼念页
          </Link>
          <Link
            href="/community-pet-obituaries"
            className={`hover:text-gray-800 ${currentPage === "community" ? "text-gray-800 font-medium" : "text-gray-600"}`}
          >
            社区宠物悼念页
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
        </div>
      </nav>
    </header>
  )
}
