import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="px-4 py-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-800">永念</span>
            </Link>
            <p className="text-gray-600 text-sm">
              为心爱的宠物创建持久的纪念，庆祝它们独特的精神和分享的无条件的爱。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">公司</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <a href="#" className="hover:text-gray-800">
                  关于永念
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  博客
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  联系我们
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  捐赠
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">法律</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <a href="#" className="hover:text-gray-800">
                  隐私政策
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  服务条款
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">通讯</h4>
            <p className="text-sm text-gray-600 mb-4">
              获取关于宠物悲伤的有用提示和纪念您心爱宠物的有意义的方式。
            </p>
            <div className="space-y-2">
              <Input placeholder="输入您的邮箱" className="text-sm" />
              <Button className="w-full bg-teal-400 hover:bg-teal-500 text-white">订阅</Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex items-center justify-between text-sm text-gray-500">
          <div>© 永念. 保留所有权利。</div>
          <div>
            <a href="#" className="hover:text-gray-700">
              成为宠物伙伴
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
