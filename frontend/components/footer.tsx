import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="px-4 py-16 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* 品牌介绍 */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-xl font-light text-gray-900">永念</span>
          </Link>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            让每一份珍贵的爱都被永远铭记，为心爱的生命创建美好而持久的纪念。
          </p>
        </div>
        
        {/* 导航链接 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          <div>
            <h4 className="font-light text-gray-900 mb-3 text-sm">公司</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <div>
                <Link href="/about" className="hover:text-gray-700 transition-colors">
                  关于永念
                </Link>
              </div>
              <div>
                <Link href="/blog" className="hover:text-gray-700 transition-colors">
                  博客
                </Link>
              </div>
              <div>
                <Link href="/contact" className="hover:text-gray-700 transition-colors">
                  联系我们
                </Link>
              </div>
              <div>
                <a href="#" className="hover:text-gray-700 transition-colors">
                  捐赠
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-light text-gray-900 mb-3 text-sm">法律</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <div>
                <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                  隐私政策
                </Link>
              </div>
              <div>
                <Link href="/terms" className="hover:text-gray-700 transition-colors">
                  服务条款
                </Link>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-light text-gray-900 mb-3 text-sm">通讯</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              获取关于陪伴悲伤的温暖指引，以及纪念挚爱的美好方式。
            </p>
            <div className="flex gap-2 max-w-sm">
              <Input 
                placeholder="输入您的邮箱" 
                className="text-xs border-gray-300 focus:border-gray-400 rounded-lg" 
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 rounded-lg">
                订阅
              </Button>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <div className="text-xs text-gray-400 font-light">
            © 2024 永念 | EternalMemory. 让每一份爱都被永远纪念.
          </div>
        </div>
      </div>
    </footer>
  )
}
